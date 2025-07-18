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
    Typography,
    CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DomainIcon from '@mui/icons-material/Domain';
import { ToastContainer, toast } from "react-toastify";
import EmployeeGraphView from "../components/EmployeeGraphView";

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedEmployeeForGraph, setSelectedEmployeeForGraph] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get("/departments/all");
            setDepartments(res.data);
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to fetch departments");
        }
    };

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("/employees/main");
            setAllEmployees(res.data);
            setEmployees(res.data);
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to fetch employees");
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading) {
            const filteredEmployees = allEmployees.filter((employee) => {
                const matchesName = selectedEmployee
                    ? employee.emp_name.toLowerCase().includes(selectedEmployee.toLowerCase())
                    : true;
                const matchesDept = selectedDept ? employee.dept_name === selectedDept : true;
                return matchesName && matchesDept;
            });
            setEmployees(filteredEmployees);
        }
    }, [selectedEmployee, selectedDept, allEmployees, isLoading]);

    const handleClear = () => {
        setSelectedEmployee("");
        setSelectedDept("");
    };

    const handleEmployeeCardClick = (employee) => {
        if (!employee?.emp_id) console.warn("emp_id missing for employee:", employee);
        setSelectedEmployeeForGraph(employee);
    };

    const handleGraphViewClose = () => {
        setSelectedEmployeeForGraph(null);
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column", position: "relative", px: { xs: 2, sm: 3, md: 1, lg: 0 } }}>
            {selectedEmployeeForGraph ? (
                <EmployeeGraphView employee={selectedEmployeeForGraph} onClose={handleGraphViewClose} />
            ) : (
                <>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">Employees</Typography>
                            <Typography sx={{ color: "#64748b" }}>Manage and track employee skills and performance</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ width: "100%", marginY: 3 }}> 
                        <TextField
                            sx={{ width: "100%", "& .MuiInputBase-root": { height: 40 } }}
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
                    </Box>

                    <Box sx={{ width: "100%", display: "flex", alignItems: "center", flexWrap: { xs: "wrap", md: "nowrap" }, gap: 2, mb: 3 }}>
                        <FormControl sx={{ flexGrow: 1, minWidth: { xs: "calc(50% - 8px)", md: 120 } }} size="small"> 
                            <InputLabel>Department</InputLabel>
                            <Select value={selectedDept} label="Department" onChange={(e) => setSelectedDept(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {departments?.map((department, index) => (
                                    <MenuItem key={index} value={department.dept_name}>{department?.dept_name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="outlined" onClick={handleClear} sx={{ textTransform: "none", height: 40, flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>Clear</Button> {/* Clear button full width on xs */}
                    </Box>


                    <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '200px' }}>
                                <CircularProgress />
                                <Typography ml={2}>Loading employees...</Typography>
                            </Box>
                        ) : (
                            employees.length > 0 ?
                                employees?.map((employee, index) => (
                                    <Card
                                        variant="outlined"
                                        key={index}
                                        sx={{
                                            marginY: 1,
                                            padding: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                            width: { xs: "100%", lg: "49%" },
                                            ":hover": { bgcolor: "#f9fafb", cursor: "pointer" }
                                        }}
                                        onClick={() => handleEmployeeCardClick(employee)}
                                    >
                                        <Typography
                                            underline="none"
                                            color="black"
                                            variant="h6"
                                            fontWeight="bold"
                                        >
                                            {employee?.emp_name}
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <DomainIcon />
                                            <Typography variant="p" fontSize={15}>{employee?.dept_name}</Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                            <Typography sx={{ width: "100%" }}>Skills</Typography>
                                            {employee?.skills?.map((s, idx) => (
                                                <Box key={idx} sx={{ width: "fit-content", px: 1, borderRadius: 5, bgcolor: "#e8e8e8" }}>
                                                    <Typography fontSize={12} fontWeight={600}>{s}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", justifyContent: "center", alignItems: "center" }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                <Typography fontSize={15} sx={{ fontWeight: 600 }}>Average</Typography>
                                                <Typography fontSize={15}>{Math.round(employee?.average_score * 10)} %</Typography>
                                            </Box>
                                            <Box sx={{ my: 1, width: "100%", height: 17, bgcolor: "#e8e8e8", borderRadius: 10 }}>
                                                <Box sx={{ width: `${employee?.average_score * 10}%`, height: 17, bgcolor: "black", borderRadius: 10 }}></Box>
                                            </Box>
                                        </Box>
                                    </Card>
                                )) :
                                <Typography variant="p" sx={{ width: "100%", textAlign: "center", marginY: 2 }}>No employees found</Typography>
                        )}
                    </Box>
                    <ToastContainer position="top-right" autoClose={500} hideProgressBar closeOnClick />
                </>
            )}
        </Container>
    );
};