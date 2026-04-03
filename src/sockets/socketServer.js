import { Server } from "socket.io";
import { env } from "../config/env.js";
import { registerChatSocket } from "./chatSocket.js";

export let io;

export const setupSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    registerChatSocket(socket, io);

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};