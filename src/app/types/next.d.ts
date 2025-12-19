import type { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

declare module "http" {
  interface Server {
    io?: IOServer;
  }
}

declare module "net" {
  interface Socket {
    server?: HTTPServer;
  }
}
