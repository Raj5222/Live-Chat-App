// import { DataSource } from "typeorm";
// import { RedisCacheService } from "./Redis_Service";

// export class RedisQueryService {
//   private dataSource: DataSource;
//   private cacheService: RedisCacheService;

//   constructor(dataSource: DataSource) {
//     this.dataSource = dataSource;
//     this.cacheService = new RedisCacheService();
//   }

//   // General method to execute queries with Redis caching
//   async queryWithCache<T>(
//     cacheKey: string,
//     queryFunction: () => Promise<T>
//   ): Promise<T> {
//     // First check cache
//     const cachedResult = await this.cacheService.getCache<T>(cacheKey);
//     if (cachedResult) {
//       return cachedResult;
//     } else {
//       console.log("Redis Miss");
//       const result = await queryFunction();
//       await this.cacheService.setCache(cacheKey, result);
//       return result;
//     }
//   }
// }
