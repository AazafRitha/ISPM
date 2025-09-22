import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import './SimulationStats.css';

const SimulationStats = () => {
  const { simulationName } = useParams();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
  useEffect(() => {
    setLoading(true);
    setError("");

    axios.get(`${BACKEND_URL}/api/simulations/${simulationName}/stats`)
      .then(res => {
        const fetchedStats = res.data.stats || [];
        setStats(fetchedStats);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setError("Failed to fetch simulation data.");
        setLoading(false);
      });
  }, [simulationName]);

  const chartData = stats
    .map((row, index) => ({
      name: row.name || row.email?.split('@')[0] || `Employee ${index + 1}`,
      Sent: row.sent ? 1 : 0,
      Clicked: row.clicked ? 1 : 0,
      FormSubmitted: row.formSubmitted ? 1 : 0,
    }))
    .filter(row => row.Sent || row.Clicked || row.FormSubmitted);

  const summaryData = stats.length > 0 ? [
    {
      name: "Overall Results",
      Sent: stats.filter(s => s.sent).length,
      Clicked: stats.filter(s => s.clicked).length,
      FormSubmitted: stats.filter(s => s.formSubmitted).length,
    }
  ] : [];

  const downloadCSV = () => {
    if (!stats.length) return;
    const headers = ["Employee", "Email", "Sent", "Clicked", "Form Submitted", "Sent At", "Clicked At"];
    const rows = stats.map(s => [
      s.name || s.email || "Unknown",
      s.email || "",
      s.sent ? "Yes" : "No",
      s.clicked ? "Yes" : "No",
      s.formSubmitted ? "Yes" : "No",
      s.sentAt ? new Date(s.sentAt).toLocaleString() : "",
      s.clickedAt ? new Date(s.clickedAt).toLocaleString() : ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${simulationName}-stats.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper className="paper-container">
      <Typography variant="h4" className="main-title">
        Simulation Stats: {simulationName}
      </Typography>

      <Button className="download-button" onClick={downloadCSV}>
        Download CSV
      </Button>

      {loading ? (
        <Typography className="info-text">Loading simulation data...</Typography>
      ) : error ? (
        <Typography className="error-text">{error}</Typography>
      ) : stats.length === 0 ? (
        <Typography className="info-text">No simulation data available.</Typography>
      ) : (
        <>
          {summaryData.length > 0 && (
            <>
              <Typography variant="h6" className="section-title">Summary Overview</Typography>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} domain={[0, dataMax => Math.max(dataMax + 1, 5)]} />
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                    <Bar dataKey="Sent" fill="#071931ff" name="Emails Sent" radius={[6,6,0,0]} />
                    <Bar dataKey="Clicked" fill="#39567dff" name="Links Clicked" radius={[6,6,0,0]} />
                    <Bar dataKey="FormSubmitted" fill="#475569" name="Forms Submitted" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {chartData.length > 0 ? (
            <>
              <Typography variant="h6" className="section-title">Individual Employee Status</Typography>
              <div className="chart-container large">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis allowDecimals={false} domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v ? "Yes" : "No"} />
                    <Tooltip formatter={(value, name) => [value ? "Yes" : "No", name]} />
                    <Legend />
                    <Bar dataKey="Sent" fill="#071931ff" name="Email Sent" radius={[6,6,0,0]} />
                    <Bar dataKey="Clicked" fill="#39567dff" name="Link Clicked" radius={[6,6,0,0]} />
                    <Bar dataKey="FormSubmitted" fill="#475569" name="Form Submitted" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <Typography className="info-text">No events recorded yet for individual employees.</Typography>
          )}

          <Table className="stats-table">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Sent</TableCell>
                <TableCell>Clicked</TableCell>
                <TableCell>Form Submitted</TableCell>
                <TableCell>Sent At</TableCell>
                <TableCell>Clicked At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.name || row.email || "Unknown"}</TableCell>
                  <TableCell>{row.email || "-"}</TableCell>
                  <TableCell>{row.sent ? "✅" : "❌"}</TableCell>
                  <TableCell>{row.clicked ? "✅" : "❌"}</TableCell>
                  <TableCell>{row.formSubmitted ? "✅" : "❌"}</TableCell>
                  <TableCell>{row.sentAt ? new Date(row.sentAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>{row.clickedAt ? new Date(row.clickedAt).toLocaleString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
};

export default SimulationStats;
