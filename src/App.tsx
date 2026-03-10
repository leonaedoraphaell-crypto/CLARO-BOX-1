import React, { useState } from "react";
import { generateImage } from "./services/imageGeneration";
import "./index.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const res = await generateImage(prompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Claro Box AI</h1>
      <input
        type="text"
        placeholder="Digite a descrição da imagem"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "300px", padding: "5px" }}
      />
      <button onClick={handleGenerate} style={{ marginLeft: 10, padding: "5px 10px" }}>
        Gerar
      </button>

      {loading && <p>Gerando imagem...</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
