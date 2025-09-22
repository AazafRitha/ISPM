import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Typography, Snackbar, Alert } from "@mui/material";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const SimulationLauncher = ({ simulationName, subject, htmlTemplate, onLaunched, employees }) => {
  const [open, setOpen] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });

  const handleCheckboxChange = (email) => {
    const updated = selectedEmails.includes(email)
      ? selectedEmails.filter((e) => e !== email)
      : [...selectedEmails, email];
    setSelectedEmails(updated);
    setSelectAll(updated.length === employees.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmails([]);
      setSelectAll(false);
    } else {
      setSelectedEmails(employees.map((e) => e.email));
      setSelectAll(true);
    }
  };

  const handleLaunch = async () => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/simulations/start`, {
        simulationName,
        subject,
        htmlTemplate,
        selectedEmployees: selectedEmails.length > 0 ? selectedEmails : undefined,
      });
      await axios.post(`${BACKEND_URL}/api/simulations/mark-launched`, { templateName: simulationName });

      setSnackbar({ open: true, msg: "Phishing simulation launched successfully!", severity: "success" });
      setOpen(false); // Close dialog on success
      onLaunched?.();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Failed to launch simulation.", severity: "error" });
    }
    setLoading(false);
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>Launch Simulation</Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Launch Simulation: {simulationName}</DialogTitle>
        <DialogContent dividers>
          {!employees || employees.length === 0 ? (
            <Typography>No employees found. Simulation will send to all employees.</Typography>
          ) : (
            <>
              <FormControlLabel control={<Checkbox checked={selectAll} onChange={handleSelectAll} />} label="Select All" />
              <Typography>Select Employees (leave empty to send to all):</Typography>
              {employees.map((emp) => (
                <FormControlLabel
                  key={emp._id}
                  control={<Checkbox checked={selectedEmails.includes(emp.email)} onChange={() => handleCheckboxChange(emp.email)} />}
                  label={`${emp.name} (${emp.email})`}
                />
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button variant="contained" onClick={handleLaunch} disabled={loading || !employees}>
            {loading ? "Launching..." : "Launch"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SimulationLauncher;
