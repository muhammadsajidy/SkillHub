import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import {
    Box,
    Button,
    Card,
    Container,
    Modal,
    TextField,
    Typography,
    CircularProgress // Import CircularProgress
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

export default function Departments() {
    const [details, setDetails] = useState([]);
    const [open, setOpen] = useState(false);
    const [newDeptName, setNewDeptName] = useState("");
    const [isLoading, setIsLoading] = useState(true); // New loading state

    useEffect(() => {
        fetchDepartmentDetails();
    }, []);

    const fetchDepartmentDetails = async () => {
        setIsLoading(true); // Set loading true before fetch
        try {
            const res = await axios.get("/departments/details");
            setDetails(res.data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch departments.");
            setDetails([]); // Ensure details is empty on error
        } finally {
            setIsLoading(false); // Set loading false after fetch
        }
    };

    const handleAddDepartment = async () => {
        if (!newDeptName.trim()) {
            toast.error("Department name cannot be empty.");
            return;
        }

        setIsLoading(true); // Set loading true during addition
        try {
            await axios.post("/departments/add", { dept_name: newDeptName.trim() });
            toast.success("Department added successfully!");
            setOpen(false);
            setNewDeptName("");
            fetchDepartmentDetails(); // Re-fetch to update list
        } catch (e) {
            console.error("Failed to add department:", e);
            toast.error(e?.response?.data?.message || "Failed to add department. Please try again.");
        } finally {
            setIsLoading(false); // Set loading false after addition
        }
    };

    // Modal style definition (moved outside for reusability if needed, but keeping it inside for now)
    const modalStyle = {
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
        gap: 2,
    };

    return (
        <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column", px: { xs: 2, sm: 3, md: 1, lg: 0 } }}> 
            <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Departments</Typography>
                    <Typography sx={{ color: "#64748b" }}>Overview of departments and their skill development</Typography>
                </Box>
                <Button variant="contained" size="small" sx={{ bgcolor: "black" }} onClick={() => setOpen(true)}>Add Department</Button> 
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', mt: 4 }}>
                    <CircularProgress />
                    <Typography ml={2}>Loading departments...</Typography>
                </Box>
            ) : (
                details.length > 0 ? (
                    <Box sx={{ mt: 4, width: "100%", display: "flex", flexWrap: "wrap", gap: 2 }}>
                        {details?.map((detail, index) => (
                            <Card
                                key={index}
                                variant="outlined"
                                sx={{
                                    width: { xs: "100%", md: "calc(50% - 8px)" }, 
                                    p: 2,
                                    boxSizing: 'border-box' 
                                }}
                            >
                                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                    <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                        <Typography variant="h6" fontWeight={500}>{detail?.dept_name}</Typography>
                                        <Box sx={{ px: 1, borderRadius: 5, bgcolor: "#f1f5f9", height: "fit-content" }}>
                                            <Typography fontSize={12} fontWeight={600}>
                                                {detail?.emp_count} employee{detail?.emp_count !== 1 ? 's' : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography fontSize={13} color="#64748b">{detail?.dept_description || "No description available."}</Typography>
                                </Box>

                                <Box sx={{ my: 2, display: "flex", justifyContent: "space-between" }}>
                                    <Typography fontSize={13} fontWeight={600}>Average Score</Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 100, height: 12, bgcolor: "#f1f5f9", borderRadius: 5 }}>
                                            <Box sx={{ bgcolor: "black", width: `${(detail?.average_score / (detail.max_score || 10)) * 100}%`, height: 12, borderRadius: 5 }}></Box>
                                        </Box>
                                        <Typography fontSize={12}>{detail?.average_score || 0}/{detail.max_score || 10}</Typography>
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography fontSize={13} fontWeight={600}>Associated Skills</Typography>
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                                        {detail?.associated_skills && detail.associated_skills.length > 0 ? (
                                            detail.associated_skills.map((s, skillIndex) => (
                                                <Box key={skillIndex} sx={{ border: '1px solid black', px: 1, borderRadius: 5 }}>
                                                    <Typography fontSize={12}>{s}</Typography>
                                                </Box>
                                            ))
                                        ) : (
                                            <Typography fontSize={12} color="text.secondary">No skills associated.</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Typography sx={{ textAlign: "center", my: 3, color: "#64748b", mt: 4 }}>
                        No departments found.
                    </Typography>
                )
            )}

            <Modal open={open} onClose={() => setOpen(false)}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" fontWeight="bold">Add Department</Typography>
                    <TextField
                        label="Department Name"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        fullWidth
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
                        <Button variant="contained" sx={{ bgcolor: "black" }} onClick={handleAddDepartment}>Add</Button>
                    </Box>
                </Box>
            </Modal>
            <ToastContainer position="top-right" autoClose={500} hideProgressBar closeOnClick />
        </Container>
    );
};