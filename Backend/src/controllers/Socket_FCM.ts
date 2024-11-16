import { Server } from "socket.io";
import { createServer } from "http";
import {
  sendMessage,
  subscribeToTopic,
  unsubscribeToTopic,
} from "./fcm_Service_Controller";

let instance;

export function ChatRoom() {
  if (instance) return instance;

  try {
    const server = createServer();
    const io = new Server(server, {
      maxHttpBufferSize: 100 * 1024 * 1024, // 100 MB
      // path: "/api/Chat",
      cors: {
        origin: "*",
      },
      transports: ["websocket"],
    });

    const port = Number(process.env.Socket_Port) || 3002;
    if (!port) console.warn("Port Not Available In Socket File.");
    server.listen(port, "0.0.0.0", () => {
      console.log(`Socket.IO server listening on port ${port}`);
    });

    const users = new Map(); // Map to store user data
    let roomAdmins = new Map(); // Map to store admin of each room
    const roomsNamespace = io.of("/rooms");
    roomsNamespace.on("connection", (socket) => {
      socket.on("roomlist", async () => {
        console.log("Room Lsit Called.");
        const rooms = Array.from(roomAdmins.keys());
        socket.emit("roomlist", {
          rooms: rooms[0] ? rooms : false,
          system: true,
        });
        console.log("Room list =>", rooms);
      });

      socket.on("disconnect", () => {
        console.log(
          `User disconnected from /rooms namespace, socket.id: ${socket.id}`
        );
      });
    });

    io.of("/chat").on("connection", (socket) => {
      //Chat socket For Chat
      console.log("Socket is connected. => ID :", socket.id);
      // join a chat
      socket.on("joinRoom", async ({ username, room, FCM_Token, uid }) => {
        socket.join(room);
        users.set(socket.id, { username, room, FCM_Token, uid });

        const roomSockets = Array.from(
          io.of("/chat").adapter.rooms.get(room) || []
        );
        const usersInRoom = roomSockets.map((socketId) => {
          return { name: users.get(socketId).username, sid: socketId };
        });

        console.log(`${username} Joined Room : ${room}`);
        if (!roomAdmins.has(room)) {
          roomAdmins.set(room, socket.id); // Set current user as the admin for this room
          console.log(`${username} is the admin of room: ${room}`);

          socket.emit("chat", {
            message: `You are now the admin of this room`,
            system: true,
            admin: {
              name: username,
              sid: socket.id,
            },
            users: usersInRoom,
          });
        }

        socket.emit("chat", {
          message: `You joined the room`,
          system: true,
          admin: {
            name: users.get(roomAdmins.get(room)).username,
            sid: roomAdmins.get(room),
          },
          users: usersInRoom,
        });

        socket.to(room).emit("chat", {
          message: `${username} joined the room`,
          system: true,
          admin: {
            name: users.get(roomAdmins.get(room)).username,
            sid: roomAdmins.get(room),
          },
          users: usersInRoom,
        });

        if (FCM_Token) {
          await subscribeToTopic(FCM_Token, room);
        } else {
          console.log("FCM Tokens Not Available");
        }
        await sendMessage(username, room);
      });

      // Group message event
      socket.on("Group", (Message_And_Attachatment) => {
        const { room } = users.get(socket.id);
        if (room) {
          console.log("New Message in room:", room, Message_And_Attachatment);
          socket.to(room).emit("chat", Message_And_Attachatment);
          //All Message Transfer From Here to Other Users.
        }
      });

      // Kick user event (admin only)
      socket.on("kickUser", (targetSocketId, room) => {
        const adminSocketId = roomAdmins.get(room);
        if (adminSocketId === socket.id) {
          const targetUser = users.get(targetSocketId);

          if (targetUser && targetUser.room === room) {
            socket.to(targetSocketId).emit("kick", {
              kick: `Admin(${
                users.get(roomAdmins.get(room)).username
              }): kicked you out of room ${room}.`,
            });
            // Mark the user as kicked
            targetUser.kicked = true;

            // Disconnect the target user from the room
            io.of("/chat").sockets.get(targetSocketId).disconnect(true);

            console.log(`${targetUser.username} was kicked from room: ${room}`);
          } else {
            console.log("User not found in the room.");
            socket.emit("chat", {
              message: "User not found in the room.",
              system: true,
            });
          }
        } else {
          console.log("You are not the admin of the room.");
          socket.emit("chat", {
            message: "You are not authorized to kick users.",
            system: true,
          });
        }
      });

      // User disconnect
      socket.on("disconnect", async () => {
        const user = users.get(socket.id);
        console.log("user => ", user);

        if (user) {
          // If the user was kicked, don't broadcast the leave message
          if (user.kicked) {
            users.delete(socket.id); // Remove the kicked user from the map

            // Emit a message to the room that the user was kicked
            socket.to(user.room).emit("chat", {
              message: `${user.username} has been kicked out of the room.`,
              system: true,
              users: Array.from(
                io.of("/chat").adapter.rooms.get(user.room) || []
              ).map((socketId) => {
                return { name: users.get(socketId).username, sid: socketId };
              }),
            });

            await unsubscribeToTopic(user.FCM_Token, user.room);

            return;
          }

          const roomSockets = Array.from(
            io.of("/chat").adapter.rooms.get(user.room) || []
          );
          const usersInRoom = roomSockets.map((socketId) => {
            return { name: users.get(socketId).username, sid: socketId };
          });

          console.log(`${user.username} Left room: ${user.room}`);
          socket.to(user.room).emit("chat", {
            message: `${user.username} Left Room ${user.room}`,
            system: true,
            users: usersInRoom,
          });

          if (user.FCM_Token) {
            await unsubscribeToTopic(user.FCM_Token, user.room);
          } else {
            console.log("FCM Tokens Not Available");
          }

          if (roomAdmins.has(user.room)) {
            // Admin logic
            const socket_id = socket.id;
            users.delete(socket.id); // Delete from user map
            if (roomAdmins.get(user.room) === socket_id) {
              roomAdmins.delete(user.room);
              console.log(
                `Admin Deleted => ${user.username}, Room : ${user.room}`
              );

              const roomSockets = Array.from(
                io.of("/chat").adapter.rooms.get(user.room) || []
              );
              const newAdminSocketId = roomSockets[0]; // Choose the first user in the room

              if (newAdminSocketId && !roomAdmins.has(user.room)) {
                roomAdmins.set(user.room, newAdminSocketId); // Assign new admin
                const newAdmin = users.get(newAdminSocketId);
                socket.to(user.room).emit("chat", {
                  message: `${newAdmin.username} is now the new admin of this Room`,
                  admin: { name: newAdmin.username, sid: newAdminSocketId },
                  users: usersInRoom,
                  system: true,
                });

                console.log(
                  `New Admin => ${newAdmin.username} is new admin of room: ${user.room}`
                );
              }
            }
          }
        }
      });

      // Connection errors
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });
    });

    instance = { io, server };
  } catch (err) {
    console.log("Socket IO Error:", err);
  }

  return instance;
}
