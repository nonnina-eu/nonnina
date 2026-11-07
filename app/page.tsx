import { redirect } from "next/navigation";

/** The marketing site lives in nonnina-eu/website. This app serves the product routes. */
export default function Home() {
  redirect("/demo");
}
