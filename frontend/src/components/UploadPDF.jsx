import { useState } from "react";
import api from "../services/api";

function UploadPDF() {

  const [file, setFile] = useState();

  const upload = async () => {

    const formData = new FormData();

    formData.append("file", file);

    await api.post(
      "/upload",
      formData
    );

    alert("Uploaded");
  };

  return (
    <>
      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <button onClick={upload}>
        Upload PDF
      </button>
    </>
  );
}

export default UploadPDF;