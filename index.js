import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import basicAuth from "express-basic-auth";
import homeRouter from "./app/routes/home.js";
import adminShedRouter from "./app/routes/admin/shed.js";
import adminTrailerRouter from "./app/routes/admin/trailer.js";
import adminMediaRouter from "./app/routes/admin/media.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const auth = basicAuth({
  users: { [process.env.ADMIN_USERNAME]: process.env.ADMIN_PASSWORD },
  challenge: true,
  realm: "Shed Admin Application",
});

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "pug");

app.use("/", homeRouter);

app.use("/admin", auth);
app.use("/admin/sheds", adminShedRouter);
app.use("/admin/trailers", adminTrailerRouter);
app.use("/admin/media", auth, adminMediaRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
