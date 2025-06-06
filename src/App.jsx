import { useState, useRef } from "react";
import { pairInfo } from "./data";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaDownload } from "react-icons/fa";

function App() {
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [totalSum, setTotalSum] = useState(null);
  const [weightage, setWeightage] = useState(null);

  const reportRef = useRef(null);

  const isValidNumber = (num) => /^\d{10}$/.test(num);

  const calculateSum = (num) => {
    let sum = num.split("").reduce((acc, curr) => acc + Number(curr), 0);
    while (sum > 9) {
      sum = sum
        .toString()
        .split("")
        .reduce((acc, curr) => acc + Number(curr), 0);
    }
    return sum;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidNumber(number)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const filteredNumber = number.replace(/0/g, "");

    const pairs = [];
    for (let i = 0; i < filteredNumber.length - 1; i++) {
      pairs.push(filteredNumber.slice(i, i + 2));
    }

    const tableData = pairs.map((pair) => {
      const info = pairInfo[pair] || { pros: "None", cons: "None" };
      return { pair, ...info };
    });

    setResults(tableData);
    setTotalSum(calculateSum(number));

    const validPros = tableData.filter(item => item.pros !== "None").length;
    const total = tableData.length;
    const wt = Math.round((validPros / total) * 100);
    setWeightage(wt);

    setError("");
  };

  const downloadPDF = () => {
    const input = reportRef.current;
    const formElement = document.getElementById("exclude-from-pdf");
    const downloadBtn = document.getElementById("exclude-download");
    formElement.style.display = "none";
    downloadBtn.style.display = "none";
  
    const originalWidth = document.body.style.width;
    const originalOverflow = document.body.style.overflow;

    document.body.style.width = "1024px";
    document.body.style.overflow = "visible";
  
    html2canvas(input, {
      scale: 2,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
  
      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;
  
      if (imgHeight < pdfHeight) {
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      } else {
        let position = 0;
        let heightLeft = imgHeight;
  
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", x, position + y, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position -= pdfHeight;
          }
        }
      }
  
      formElement.style.display = "block";
      downloadBtn.style.display = "flex";
      document.body.style.width = originalWidth;
      document.body.style.overflow = originalOverflow;
  
      pdf.save(`report_${number}.pdf`);
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div ref={reportRef}>
        <div className="w-full max-w-4xl flex flex-col items-center space-y-6">

          <img src="logo.png" alt="CosmicVastu" className="h-16" />

          <h1 className="text-2xl md:text-4xl font-bold text-blue-900 text-center">
            Mobile Numerology Report
          </h1>

          <p className="text-gray-600 text-center text-lg">
            Explore The Hidden Harmony And Numerological Power Of Your Mobile Number.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4" id="exclude-from-pdf">
            <input
              type="text"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setError("");
                setResults([]);
                setTotalSum(null);
                setWeightage(null);
              }}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={!isValidNumber(number)}
              className={`w-full py-3 rounded-md text-white font-semibold ${isValidNumber(number)
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Submit
            </button>
          </form>

          {results.length > 0 && (
            <div className="w-full">

              <div className="text-center text-gray-700 text-md md:text-lg my-6">
                Your Mobile Number:{" "}
                <span className="text-blue-900 font-bold md:text-lg text-md">
                  {number.split("").join(" ")}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="bg-orange-400 text-white px-6 py-3 rounded-full font-bold text-lg">
                  Total Sum : {totalSum}
                </div>
                <div className="bg-orange-400 text-white px-6 py-3 rounded-full font-bold text-lg">
                  Total Weightage : {weightage}%
                </div>
              </div>

              <div className="overflow-x">
                <table className="min-w-full border border-gray-400 rounded-lg overflow-hidden text-center mb-8">
                  <thead className="bg-gray-300 text-blue-900 uppercase text-md">
                    <tr>
                      <th className="border px-4 py-2">Pair</th>
                      <th className="border px-4 py-2">Pros</th>
                      <th className="border px-4 py-2">Cons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, idx) => (
                      <tr
                        key={idx}
                        className="even:bg-gray-100 odd:bg-white"
                      >
                        <td className="border px-4 py-2 font-bold text-blue-900">{item.pair}</td>
                        <td className="border px-4 py-2">
                          <span className="text-green-600">{item.pros}</span>
                        </td>
                        <td className="border px-4 py-2">
                          <span className="text-red-500">{item.cons}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center mb-8" id="exclude-download">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg transition-all"
                >
                  <FaDownload />
                  Download PDF
                </button>
              </div>

              <div className="text-center mt-8 text-gray-600 italic">
                “Do Not Gamble With The life, take astrological & Vastu Help.”
              </div>
              <div className="text-center text-gray-800 font-semibold mt-2 mb-10">
                Astro Viraj - 9369257315
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;