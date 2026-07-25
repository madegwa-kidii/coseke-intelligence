'use client'

import SignaturePad from "@/components/SignaturePad";

export default function Home() {


  const save = () => {

  }
  return (
    <SignaturePad onSave={save} />
  );
}
