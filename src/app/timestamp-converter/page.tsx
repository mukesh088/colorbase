import { redirect } from "next/navigation";

/** Old alias — canonical tool is /unix-timestamp-converter */
export default function Page() {
  redirect("/unix-timestamp-converter");
}
