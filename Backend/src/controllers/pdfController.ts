import { Request, Response, Errback} from "express";
import { User } from "../entity/Users";
import { AppPostgressSource } from "../config/data-source1";
import { verifyToken } from "../Services/jwt";
import { pdfGfunction } from "../Services/PDF/pdfGenerate";
import { createExcelFile } from "../Services/exelGenerate";
import { Any } from "typeorm";

export const pdfgenerate = async (
  req: Request,
  res: Response,
  err: Errback
) => {
  try {
    const jwtToken = req.headers.authorization;
    if (!jwtToken) {
      res.status(401).json({ error: "JWT token is required" });
    }

    const tokenResponse = verifyToken(jwtToken);

    if (tokenResponse.exp) {
      const userRepository = await AppPostgressSource.getRepository(User)
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role") // Adjust based on your actual relationship
        .select([
          "user.firstname",
          "user.lastname",
          "user.email",
          "user.mobile",
          "user.status",
          "user.u_id",
          "role.role",
        ])
        .getMany();

        if(userRepository.length === 0){
          res.status(500).json({ error: "No Data Available" })
        }else{
        const updatedUsers = userRepository.map((user) => ({
          "First Name": user.firstname,
          "Last Name": user.lastname,
          Email: user.email,
          Mobile: user.mobile,
          Role: Object.values(user.role)[0],
          Status: user.status ? "Active" : "Inactive",
          "Unique ID": user.u_id,
        }));

      if(req.query.type === 'pdf'){
        const title = Object.keys(updatedUsers[0])
        const data = updatedUsers.map((element)=>{
          return Object.values(element);
        })
        

        const pdftitle = `User's Data`;
        const pdfData = await pdfGfunction(pdftitle, title, data).then(); //Call Pdf G Function For Creating Row Data Into PDF Buffer
  
        // res.setHeader("Content-type", "application/pdf");
        res.set("Content-Disposition", "attachment; filename=data.pdf");
        res.type("application/pdf");
  
        console.log("PDF Data =>",pdfData)
  
        res.send(pdfData);
      } else if (req.query.type === 'excel'){ //Excel Request Handle Here
        const title = Object.keys(updatedUsers[0]);
        const data = Object.values(updatedUsers).map((row) => Object.values(row));
        const exeldata = await createExcelFile([title,...data]).then() //Give Title And data And Get Excel Buffer from Function

        // Set Headers For Excel Files
           res.set("Content-Disposition", "attachment; filename=data.xlsx");
           res.type("application/vnd.ms-excel");

         // Send the Excel file
         res.send(exeldata);
      }else{
        res.status(500).json({ error: "Invalid File Type." });
      }
    }

    } else {
      res.status(500).json({ error: "Invalid Or Expired JWT token" });
    }
  } catch (error) {
    err(error);
  }
};
