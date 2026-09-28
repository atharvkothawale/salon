import * as net from "net";

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on("connect", () => {
  console.log("Successfully connected to db.rjirqofvknwxefbtotni.supabase.co:5432!");
  socket.destroy();
});

socket.on("timeout", () => {
  console.log("Connection timed out.");
  socket.destroy();
});

socket.on("error", (err) => {
  console.log("Connection error:", err.message);
});

socket.connect(5432, "db.rjirqofvknwxefbtotni.supabase.co");
