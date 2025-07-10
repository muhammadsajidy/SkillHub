import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
    Box,
    Button,
    Card,
    Container,
    Modal,
    TextField,
    Typography
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

export default function Departments() {
    const [details, setDetails] = useState([]);
    const [open, setOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");

    useEffect(() => {
        fetchDepartmentDetails();
    }, []);

    const fetchDepartmentDetails = async () => {
        try {
            const res = await axios.get("/departments/details");
            setDetails(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddDepartment = async () => {
        if (!newDeptName.trim()) return;

        try {
            await axios.post("/departments/add", { dept_name: newDeptName.trim() });
            toast.success("Department added successfully!");
            setOpen(false);
            setNewDeptName("");
            fetchDepartmentDetails();
        } catch (e) {
            console.error("Failed to add department:", e);
            toast.error("Failed to add department. Please try again.");
        }
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Departments</Typography>
                    <Typography sx={{ color: "#64748b" }}>Overview of departments and their skill development</Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ bgcolor: "black" }} onClick={() => setOpen(true)}>Add Department</Button>
            </Box>

            <Box sx={{ mt: 4, width: "100%", display: "flex", flexWrap: "wrap", gap: 2 }}>
                {details?.map((detail, index) => (
                    <Card key={index} variant="outlined" sx={{ width: { sm: "100%", lg: "49%" }, p: 2 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" fontWeight={500}>{detail?.dept_name}</Typography>
                                <Box sx={{ px: 1, borderRadius: 5, bgcolor: "#f1f5f9", height: "fit-content" }}>
                                    <Typography fontSize={12} fontWeight={600}>
                                        {detail?.emp_count} employee{detail?.emp_count > 1 ? 's' : ''}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography fontSize={13} color="#64748b">{detail?.dept_description}</Typography>
                        </Box>

                        <Box sx={{ my: 2, display: "flex", justifyContent: "space-between" }}>
                            <Typography fontSize={13} fontWeight={600}>Average Score</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ width: 100, height: 12, bgcolor: "#f1f5f9", borderRadius: 5 }}>
                                    <Box sx={{ bgcolor: "black", width: `${detail?.average_score * 10}px`, height: 12, borderRadius: 5 }}></Box>
                                </Box>
                                <Typography fontSize={12}>{detail?.average_score}/{detail.max_score}</Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography fontSize={13} fontWeight={600}>Associated Skills</Typography>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                                {detail?.associated_skills.map((s, index) => (
                                    <Box key={index} sx={{ border: '1px solid black', px: 1, borderRadius: 5 }}>
                                        <Typography fontSize={12}>{s}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Card>
                ))}
            </Box>

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                    }}
                >
                    <Typography variant="h6" fontWeight="bold">Add Department</Typography>
                    <TextField
                        label="Department Name"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        fullWidth
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddDepartment}>Add</Button>
                    </Box>
                </Box>
            </Modal>
            <ToastContainer position="top-right" autoClose={500} hideProgressBar closeOnClick />
        </Container>
    );
};