import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import { 
    Box,
    Button,
    Card,
    Container,
    FormControl,
    InputAdornment, 
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DomainIcon from '@mui/icons-material/Domain';
import { ToastContainer, toast } from "react-toastify";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
      await axios.get("/departments/all")
      .then((res) => setDepartments(res.data))
      .catch((e) => toast.error(e.data?.error || "Failed to fetch departments"));
  };

  const fetchEmployees = async () => {
    await axios.get("employees/main")
    .then((res) => setEmployees(res.data))
    .catch((e) => toast.error(e.data?.error || "Failed to fetch employees"));
  };

  const handleSearch = () => {
    const filteredEmployees = employees.filter((employee) => {
      const matchesName = selectedEmployee ? employee.emp_name.toLowerCase().includes(selectedEmployee.toLowerCase()) : true;
      const matchesDept = selectedDept ? employee.dept_name === selectedDept : true;
      return matchesName && matchesDept;  
    });
    setEmployees(filteredEmployees);
  };

  const handleClear = () => {
    setSelectedEmployee("");
    setSelectedDept("");
    fetchEmployees();
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", }}>
            <Box>
                <Typography variant="h5" fontWeight="bold">Employees</Typography>
                <Typography sx={{ color: "#64748b" }}>Manage and track employee skills and performance</Typography>
            </Box>
        </Box>

        <Box sx={{ width: "100%", marginY: 3, display: "flex", alignItems: "center", flexWrap: { sm: "wrap", lg: "nowrap" }, gap: 2 }}>
            <TextField
              sx={{ width: { xs: "100%", lg: "55%" }, "& .MuiInputBase-root": { height: 40 } }}
              placeholder="Search employees..."
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
            <FormControl sx={{ width: { sm: 217, lg: 180 } }} size="small">
              <InputLabel>Department</InputLabel>
              <Select value={selectedDept} label="Department" onChange={(e) => setSelectedDept(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {departments?.map((department, index) => (
                  <MenuItem key={index} value={department.dept_name}>{department?.dept_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ textTransform: "none", height: 40, bgcolor: "#f1f5f9", color: "black" }}
                onClick={handleSearch}
            >
                <SearchIcon />Search
              </Button>
              <Button variant="outlined" onClick={handleClear} sx={{ textTransform: "none", height: 40 }}>Clear</Button>
            </Box>
        </Box>

        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 1 }}>
          {employees.length > 0 ? 
          employees?.map((employee, index) => (
            <Card variant="outlined" key={index} sx={{ marginY: 1, padding: 2, display: "flex", flexDirection: "column", gap: 2, width: { sm: "100%", lg: "49%" } }}>
              <Typography variant="h6" fontWeight="bold">{employee?.emp_name}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <DomainIcon />
                <Typography variant="p" fontSize={15}>{employee?.dept_name}</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ width: "100%" }}>Skills</Typography>
                {employee?.skills?.map((s, index) => (
                  <Box key={index} sx={{ width: "fit-content", px: 1, borderRadius: 5, bgcolor: "#e8e8e8" }}>
                      <Typography fontSize={12} fontWeight={600}>{s}</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column",  width: "100%", justifyContent: "center", alignItems: "center" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <Typography fontSize={15} sx={{ fontWeight: 600 }}>Average</Typography>
                  <Typography fontSize={15}>{employee?.average_score*10} %</Typography>
                </Box>
                <Box sx={{ my: 1, width: "100%", height: 17, bgcolor: "#e8e8e8", borderRadius: 10 }}>
                  <Box sx={{ width: `${employee?.average_score * 10}%`, height: 17, bgcolor: "black", borderRadius: 10 }}></Box>
                </Box>
              </Box>
            </Card>
          )) :
          <Typography variant="p" sx={{ width: "100%", textAlign: "center", marginY: 2 }}>No employees found</Typography>
          }
        </Box>
        <ToastContainer position="top-right" autoClose={500} hideProgressBar closeOnClick />
    </Container>
  );
};