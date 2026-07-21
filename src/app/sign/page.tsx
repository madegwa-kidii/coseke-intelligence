'use client'

import SignaturePad from "@/app/components/SignaturePad";

export default function Home() {


  const save = () => {

  }
  return (
    <SignaturePad onSave={save} />
  );
}
