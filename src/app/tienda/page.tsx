import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Tienda | Baltica T-Shirts",
};

export default function Tienda() {
  return (
    <Suspense fallback={<div className="wrap shop" />}>
      <ShopClient />
    </Suspense>
  );
}
