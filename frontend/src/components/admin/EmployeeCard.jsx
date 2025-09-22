import React from "react";
import { Card } from "@mui/material";
import "./EmployeeCard.css";

const EmployeeCard = ({ employee, onUpdate, onDelete }) => {
  return (
    <Card className="employee-card flat-card">
      <div className="employee-initial-section">
        <span className="employee-initial">
          {employee.name ? employee.name.charAt(0) : "?"}
        </span>
      </div>

      <div className="employee-card-content">
        <h3 className="employee-name-centered">{employee.name || "Unknown"}</h3>
        <p>
          <span className="label">ID:</span> {employee.employeeID || "-"}
        </p>
        <p>
          <span className="label">Email:</span> {employee.email || "-"}
        </p>
        <p>
          <span className="label">NIC:</span> {employee.nic || "-"}
        </p>
        <p>
          <span className="label">Address:</span> {employee.address || "-"}
        </p>
        <p>
          <span className="label">Department:</span> {employee.department || "-"}
        </p>
      </div>

      <div className="employee-card-actions">
        <button
          className="ghost-btn update"
          onClick={() => onUpdate(employee)}
        >
          Update
        </button>
        <button
          className="ghost-btn delete"
          onClick={() => onDelete(employee._id)}
        >
          Delete
        </button>
      </div>
    </Card>
  );
};

export default EmployeeCard;
