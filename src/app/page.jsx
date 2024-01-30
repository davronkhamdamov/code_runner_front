"use client";
import { useRef, useState } from "react";

export default function Home() {
  const textarea = useRef(null);
  const [output, setOutput] = useState();
  const [language, setLanguage] = useState("c");
  const [status, setStatus] = useState("");
  const [jobId, setjobId] = useState("");

  const runCode = async () => {
    const payload = {
      language,
      code: textarea.current.value,
    };
    setjobId("");
    setStatus("pending");
    setOutput("");
    const response = await fetch("http://localhost:4000/code/run", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
      });
    let intervalId;
    intervalId = setInterval(async () => {
      const data = await fetch(
        "http://localhost:4000/code/status?id=" + response.jobId
      ).then((res) => res.json());
      const { error, success, job } = data;
      if (success) {
        const { output: jobOutput, status: jobStatus } = job;

        setStatus(jobStatus);
        setjobId(response.jobId);

        if (jobStatus === "pending") return;

        setOutput(jobOutput);
        clearInterval(intervalId);
      } else {
        setStatus("Error try again");
        console.error(error);
        setOutput(error);
      }
    }, 1000);
  };
  return (
    <div className="container mx-auto mt-5 flex justify-center flex-col gap-5">
      <h1 className="text-6xl font-medium text-center font-sans">
        Online code compiler
      </h1>
      <div className="flex flex-col gap-5">
        <select
          className="w-60 p-1 mx-auto"
          onChange={(e) => {
            console.log(e.target.value);
            setLanguage(e.target.value);
          }}
          value={language}
        >
          <option value="c">C</option>
          <option value="nodejs">Nodejs</option>
          <option value="py">Python</option>
        </select>
        <textarea
          name=""
          ref={textarea}
          id=""
          cols="100"
          rows="20"
          className="resize-none border-2 border-black-400 border-solid rounded-xl p-3"
        ></textarea>
      </div>
      <button
        onClick={runCode}
        className="border-2 w-28 h-10 rounded-xl bg-slate-400 text-white hover:bg-slate-500 active:bg-slate-600 mx-auto"
      >
        Run
      </button>
      <div className="flex gap-10">
        <div>
          <span>Status</span>
          <p>{status}</p>
        </div>
        <div>
          <span>Job ID</span>
          <p>{jobId && `Job id is ${jobId}`}</p>
        </div>
        <div>
          <p>Output</p>
          <textarea value={output} cols="30" rows="10"></textarea>
        </div>
      </div>
    </div>
  );
}
