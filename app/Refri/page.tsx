
import { title } from "@/components/primitives";
import RefriTable from "@/components/refrigerator_table";

async function fetchRefriApiCall() {
  console.log("fetchRefriApiCall called");
  const res = await fetch(`${process.env.BASE_URL}/api/refrigerator`, {cache: "no-store"})
  return res.json();
}

export default async function RefriPage() {
  const response = await fetchRefriApiCall();
  console.log("check");
  console.log(response.data);
  return (
    <div className = "flex flex-col space-y-8">
      <h1 className={title()}>냉장고</h1>
      <RefriTable refris={response.data ?? []} />
    </div>
  );
}
