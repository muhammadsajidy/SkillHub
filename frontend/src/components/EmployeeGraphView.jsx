import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../axios/axiosInstance";

export default function EmployeeGraphView({ employee, onClose }) {
  const [graphData, setGraphData] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [skillIds, setSkillIds] = useState({}); 

  useEffect(() => {
    if (employee?.emp_id) {
      console.log("Fetching data for employee ID:", employee.emp_id);
      fetchEmployeeData();
    }
  }, [employee]);

  const fetchEmployeeData = async () => {
    try {
      // Fetch employee-specific skills with skill_ids
      const skillsRes = await axios.get(`/skills/employee-skills?empId=${employee.emp_id}`);
      const skillsData = skillsRes.data;
      if (skillsData.length > 0) {
        const skillNames = skillsData.map(skill => skill.skill_name);
        const skillIdMap = skillsData.reduce((acc, skill) => {
          acc[skill.skill_name] = skill.skill_id;
          return acc;
        }, {});
        setAvailableSkills(skillNames);
        setSkillIds(skillIdMap);
        setSelectedSkill(skillNames[0]); 
      } else {
        setAvailableSkills([]);
        setSelectedSkill("");
      }

      const growthRes = await axios.get(`/analytics/employee-growth/${employee.emp_id}`);
      let data = Array.isArray(growthRes.data) ? growthRes.data : [growthRes.data];
      if (data.length > 0) {
        const years = [...new Set(data.map(item => item.year))].sort();
        setAvailableYears(years);
        setSelectedYear(years[0] || ""); 
        if (skillsData.length > 0) {
          fetchGraphData(skillNames[0], years[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setGraphData([]);
    }
  };

  const fetchGraphData = async (skillName, year) => {
    try {
      const skillId = skillIds[skillName];
      if (!skillId) {
        console.warn("No skill_id found for skill:", skillName);
        setGraphData([]);
        return;
      }
      const params = { skill_id: skillId };
      if (year) params.year = year;
      console.log("Fetching graph data with params:", params);
      const res = await axios.get(`/analytics/employee-growth/${employee.emp_id}`, { params });
      let dataToProcess = Array.isArray(res.data) ? res.data : [res.data];
      console.log("Raw API response:", dataToProcess);
      const transformedData = dataToProcess
        .filter(item => item.skill_name === skillName)
        .reduce((acc, item) => {
          const timeKey = `${item.year}-${item.quarter}`;
          let dataPoint = acc.find(d => d.time === timeKey);
          if (!dataPoint) {
            dataPoint = { time: timeKey };
            acc.push(dataPoint);
          }
          dataPoint.score = parseFloat(item.score);
          return acc;
        }, [])
        .sort((a, b) => {
          const [yearA, quarterA] = a.time.split('-');
          const [yearB, quarterB] = b.time.split('-');
          return yearA - yearB || quarterA.localeCompare(quarterB);
        });
      console.log("Transformed graph data:", transformedData);
      setGraphData(transformedData);
    } catch (err) {
      console.error("Error loading graph data:", err);
      setGraphData([]);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with selectedSkill:", selectedSkill, "selectedYear:", selectedYear);
    if (selectedSkill && selectedYear) {
      fetchGraphData(selectedSkill, selectedYear);
    } else if (selectedSkill) {
      fetchGraphData(selectedSkill, null); // All time if no year selected
    }
  }, [selectedSkill, selectedYear]);

  return (
    <Card variant="outlined" sx={{ width: "100%", maxWidth: 800, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {employee?.emp_name || "Employee"} — Skill Growth
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Skill</InputLabel>
            <Select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              label="Skill"
              disabled={!availableSkills.length}
            >
              {availableSkills.map((skill) => (
                <MenuItem key={skill} value={skill}>{skill}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year"
              disabled={!availableYears.length}
            >
              <MenuItem value="">All Time</MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {graphData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData}>
              <XAxis dataKey="time" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name={selectedSkill || "Score"}
                stroke="hsl(200, 70%, 50%)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography>No data available for this employee</Typography>
        )}
      </CardContent>
    </Card>
  );
};