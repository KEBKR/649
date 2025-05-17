import { useState, useEffect } from "react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const initialDraws = [];
const initialFrequency = Array.from({ length: 49 }, (_, i) => ({ number: i + 1, count: 0 }));

export default function App() {
  const [draws, setDraws] = useState(initialDraws);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [prediction, setPrediction] = useState([]);
  const [form, setForm] = useState({ date: "", numbers: ["", "", "", "", "", ""], bonus: "" });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    updateFrequency();
  }, [draws]);

  const updateFrequency = () => {
    const counts = Array(49).fill(0);
    draws.forEach(draw => {
      draw.numbers.forEach(num => counts[num - 1]++);
    });
    setFrequency(counts.map((count, i) => ({ number: i + 1, count })));
  };

  const generatePrediction = () => {
    const weights = frequency.map(f => f.count + 1); // avoid 0-weight
    const result = new Set();
    while (result.size < 6) {
      const index = weightedRandom(weights);
      result.add(index + 1);
    }
    const predictionResult = Array.from(result).sort((a, b) => a - b);
    setPrediction(predictionResult);
    setHistory(prev => [{ date: new Date().toISOString(), prediction: predictionResult }, ...prev]);
  };

  const weightedRandom = (weights) => {
    const total = weights.reduce((acc, val) => acc + val, 0);
    const rand = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand < sum) return i;
    }
  };

  const handleFormChange = (index, value) => {
    const newNumbers = [...form.numbers];
    newNumbers[index] = value;
    setForm({ ...form, numbers: newNumbers });
  };

  const submitDraw = () => {
    const nums = form.numbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
    const bonus = parseInt(form.bonus, 10);
    if (nums.length === 6 && !isNaN(bonus)) {
      const newDraw = { date: form.date || new Date().toISOString(), numbers: nums, bonus };
      setDraws(prev => [...prev, newDraw]);
      setForm({ date: "", numbers: ["", "", "", "", "", ""], bonus: "" });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">Crab Price Lookup - Lotto 6/49 Predictor</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Add New Draw</h2>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border" />
        <div className="grid grid-cols-3 gap-2">
          {form.numbers.map((num, i) => (
            <input key={i} type="number" value={num} onChange={e => handleFormChange(i, e.target.value)} className="p-2 border" />
          ))}
        </div>
        <input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} placeholder="Bonus Number" className="w-full p-2 border mt-2" />
        <button onClick={submitDraw} className="bg-blue-600 text-white px-4 py-2 rounded">Add Draw</button>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Number Frequency</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={frequency}>
            <XAxis dataKey="number" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Predicted Numbers</h2>
        <button onClick={generatePrediction} className="bg-green-600 text-white px-4 py-2 rounded">Generate Prediction</button>
        {prediction.length > 0 && <p className="text-xl">{prediction.join(", ")}</p>}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Prediction History</h2>
        <ul className="text-sm space-y-1">
          {history.map((h, i) => (
            <li key={i}>{format(new Date(h.date), "MMM dd, yyyy HH:mm")} — {h.prediction.join(", ")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}