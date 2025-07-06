"use client";

import { Padding } from "@mui/icons-material";
import DataTable from "@/components/DataTable";

export default function Home() {
  return (
    <main style={{padding:"2rem"}}>
      <h1>Dynamic Data table manager</h1>
       <DataTable/>
    </main>
  );
}
