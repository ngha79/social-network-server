const { createClient } = require("redis");

const redis = createClient({
  password: "ezRV7ZuMvMEBk4rEc3oyRhYt4v6gYbeD",
  socket: {
    host: "redis-18847.c57.us-east-1-4.ec2.cloud.redislabs.com",
    port: 18847,
  },
});

redis.on("error", (err) => console.log("Redis Error: ", err));
redis.on("connect", () => console.log("Redis Connected"));
redis.connect();

async function main() {
  const user = {
    name: "Bob",
    // The field of a Redis Hash key can only be a string.
    // We can write `age: 20` here but ioredis will convert it to a string anyway.
    age: "20",
    description: "I am a programmer",
  };

  await redis.hSet("user-hash", user);

  const name = await redis.hGet("user-hash", "name");
  console.log(name); // "Bob"

  const age = await redis.hGet("user-hash", "age");
  console.log(age); // "20"

  const all = await redis.hGetAll("user-hash");
  console.log(all); // { age: '20', name: 'Bob', description: 'I am a programmer' }
  console.log(all.age);
  console.log(all.name);
  console.log(all.description);

  // or `await redis.hdel("user-hash", "name", "description")`;
  await redis.hDel("user-hash", ["name", "description"]);

  const exists = await redis.hExists("user-hash", "name");
  console.log(exists); // 0 (means false, and if it's 1, it means true)

  await redis.hIncrBy("user-hash", "age", 1);
  const newAge = await redis.hGet("user-hash", "age");
  console.log(newAge); // 21

  await redis.hSetNX("user-hash", "age", "23");
  console.log(await redis.hGet("user-hash", "age")); // 21, as the field "age" already exists.
}

main();
