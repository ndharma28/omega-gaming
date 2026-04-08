import SadratDisclosure from "./SadratDisclosure";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment Methods Disclosed — Omega Gaming",
  description:
    "A full disclosure of the SADRAT behavioral framework used in Chronicle recruitment copy. We show our work. The CIA does not.",
};

export default function SadratPage() {
  return <SadratDisclosure />;
}
