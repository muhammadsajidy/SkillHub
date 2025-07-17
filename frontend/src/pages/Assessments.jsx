import { useEffect, useState } from "react";
import axios from "../axios/axiosInstance";
import { Box, Button, Card, Container, InputLabel, FormControl, MenuItem, Modal, Pagination, Select, Stack, Table, TableBody, TableContainer, TableCell, TableHead, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
};

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

export default function Assessments() {
  const [results, setResults] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [empName, setEmpName] = useState("");
  const [skills, setSkills] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const LIMIT = 10;

  const [modalOpen, setModalOpen] = useState(false);

  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('');

  const [formData, setFormData] = useState({ 
    score: "", quarter: "", year: "", comment: "" 
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);


  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchSkills();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, selectedEmpId, selectedDept, selectedSkill]);

  const fetchEmployees = async () => {
    await axios.get("/employees/all")
    .then((res) => setEmployees(res.data))
    .catch((e) => toast.error(e?.response.data.error));
  };

  const fetchDepartments = async () => {
    await axios.get("/departments/all")
    .then((res) => setDepartments(res.data))
    .catch((e) => toast.error(e?.response.data.error));
  };

  const fetchSkills = async () => {
    await axios.get("/skills/all")
    .then((res) => setSkills(res.data))
    .catch((e) => toast.error(e?.response.data.error));
  };

  const fetchSkillEvaluations = async (pageNumber) => {
    const offset = (pageNumber - 1) * LIMIT;
    await axios.get("/evaluations/details", {
      params: {
        limit: LIMIT,
        offset: offset,
        sortBy: orderBy || 'year',
        order: order || 'asc',      
      }
    })
    .then((res) => {
      console.log(res.data.result);
      setResults(res.data?.result || []);
      const totalCount = res.data?.dataSize?.[0]?.count || 0;
      setPages(totalCount > 0 ? Math.ceil(totalCount / LIMIT) : 1);
    }).catch((e) => {
      toast.error(e?.response.data.error);
      setResults([]);
      setPages(1);
    });
  };

  const fetchData = async () => {
    if (!selectedEmpId && !selectedDept && !selectedSkill) {
      await fetchSkillEvaluations(page);
      return;
    }
    try {
      const res = await axios.get("/evaluations/search", {
        params: {
          empId: selectedEmpId || undefined,
          department: selectedDept || undefined,
          skill: selectedSkill || undefined,
        }
      });
      setResults(res?.data || []);
    } catch (e) {
      toast.error(e?.response.data.error);
      setResults([]);
      setPages(1);
    };
  };

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const handleClearSearch = () => {
    setSelectedEmpId('');
    setEmpName('');
    setSelectedDept('');
    setSelectedSkill('');
    setPage(1);
  };

  const handleSubmit = async () => {
    await axios.post("/evaluations/add", formData, {
      params: {
        empId: selectedEmpId,
        skillId: selectedSkillId,
      }
    }).then((res) => {
      toast.success(res.data.message || "Evaluation added successfully!");
      setModalOpen(false);
      fetchSkillEvaluations(1);
      resetForm();
    }).catch((e) => {
      console.error(e);
      toast.error(e?.response.data.error);
      setModalOpen(false);
      fetchSkillEvaluations(1);
      resetForm();
    });
  };

  const handleDeptChange = (value) => {
    setSelectedDept(value);
    setPage(1);
  };

  const handleSkillChange = (value) => {
    setSelectedSkill(value);
    setPage(1);
  };

  const resetForm = () => {
    setSelectedEmpId("");
    setSelectedSkillId("");
    setFormData({ score: "", quarter: "", year: "", comment: "" });
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDelete = async (evalId) => {
    await axios.delete(`/evaluations/remove/${evalId}`)
    .then((res) => {
      toast.success(res.data.message || "Evaluation deleted successfully!");
      fetchSkillEvaluations(page);
    }
    ).catch((e) => {
      console.error(e);
      toast.error(e?.response.data.error);
    });
  };

  const handleUpdate = async () => {
    if (!editData) return;

    try {
      await axios.put(`/evaluations/update/${editData.eval_id}`, {
        score: editData.score,
        quarter: editData.quarter,
        year: editData.year,
        comment: editData.comment,
      });

      toast.success("Evaluation updated successfully");
      setEditModalOpen(false);
      setEditData(null);
      fetchSkillEvaluations(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
      console.error(e);
    }
  };

  const handleEditClick = (detail) => {
    setEditData({ ...detail });
    setEditModalOpen(true);
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Assessments</Typography>
          <Typography sx={{ color: "#64748b" }}>Review and evaluate employee performance across key skills</Typography>
        </Box>
        <Button variant="contained" size="small" sx={{ bgcolor: "black" }} onClick={() => setModalOpen(true)}>Add Evaluation</Button>
      </Box>

      <Box sx={{ width: "100%", marginY: 3, display: "flex", alignItems: "center", flexWrap: { xs: "wrap", lg: "nowrap" }, gap: 2 }}>
        <Autocomplete options={employees} getOptionLabel={(option) => option.emp_name} value={employees.find((emp) => emp.emp_id === selectedEmpId) || null} onChange={(_, newValue) => { setSelectedEmpId(newValue?.emp_id || ''); setEmpName(newValue?.emp_name || ''); setPage(1); }} renderInput={(params) => (<TextField {...params} placeholder="Search employees..." size="small" />)} sx={{ width: { xs: "100%", lg: "50%" } }} />
        <FormControl sx={{ minWidth: { xs: "40%", sm: "41%", lg: 180} }} size="small">
          <InputLabel>Department</InputLabel>
          <Select value={selectedDept} label="Department" onChange={(e) => handleDeptChange(e.target.value)} MenuProps={{ PaperProps: { style: { maxHeight: 200, minHeight: 100, maxWidth: { xs: "30%" } } } }}>
            <MenuItem value="">All</MenuItem>
            {departments?.map((department, index) => (<MenuItem key={index} value={department.dept_name}>{department?.dept_name}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: { xs: "30%", sm: "42%", lg: 180} }} size="small">
          <InputLabel>Skill</InputLabel>
          <Select value={selectedSkill} label="Skill" onChange={(e) => handleSkillChange(e.target.value)} MenuProps={{ PaperProps: { style: { maxHeight: 200, minHeight: 100 } } }}>
            <MenuItem value="">None</MenuItem>
            {skills?.map((skill, index) => (<MenuItem key={index} value={skill.skill_name}>{skill?.skill_name}</MenuItem>))}
          </Select>
        </FormControl>
        <Button variant="outlined" sx={{ textTransform: "none", height: 40 }} onClick={handleClearSearch}>Clear</Button>
      </Box>

      <TableContainer component={Card} variant="outlined">
        <Table sx={{ minWidth: 600 }} aria-label="employee table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: 15, color: "#748397" }}>Name</TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }}>Department</TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }}>Skill</TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }}>Skill Level</TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }} sortDirection={orderBy === 'score' ? order : false}>
                <TableSortLabel active={orderBy === 'score'} direction={orderBy === 'score' ? order : 'asc'} onClick={() => handleSortRequest('score')}>
                  Score
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }}>Max Score</TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }} sortDirection={orderBy === 'quarter' ? order : false}>
                <TableSortLabel active={orderBy === 'quarter'} direction={orderBy === 'quarter' ? order : 'asc'} onClick={() => handleSortRequest('quarter')}>
                  Quarter
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }} sortDirection={orderBy === 'year' ? order : false}>
                <TableSortLabel active={orderBy === 'year'} direction={orderBy === 'year' ? order : 'asc'} onClick={() => handleSortRequest('year')}>
                  Year
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontSize: 15, color: "#748397" }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...results].sort(getComparator(order, orderBy)).map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{detail?.emp_name}</TableCell>
                <TableCell>{detail?.dept_name}</TableCell>
                <TableCell>{detail?.skill_name}</TableCell>
                <TableCell>{detail?.skill_level}</TableCell>
                <TableCell align="center">{detail?.score}</TableCell>
                <TableCell align="center">{detail?.max_score}</TableCell>
                <TableCell align="center">{detail?.quarter}</TableCell>
                <TableCell>{detail?.year}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                    <Button variant="outlined" size="small" sx={{ textTransform: "none" }} onClick={() => handleEditClick(detail)}>Edit</Button>
                    <Button variant="contained" size="small" sx={{ textTransform: "none" }} onClick={() => handleDelete(detail?.eval_id)}>Delete</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {results.length > 0 ? 
      <Stack sx={{ my: 3 }} alignItems="center">
        {(!selectedDept && !selectedSkill && !selectedEmpId) && (
          <Pagination count={pages} page={page} onChange={handlePageChange} variant="outlined" shape="rounded" />
        )}
      </Stack> :
      <Typography sx={{ textAlign: "center", my: 3, color: "#64748b" }}>
        {empName.trim() ? "No results found for the given employee name." : "No results found."}
      </Typography>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4, maxHeight: "90vh", overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>Add Evaluation</Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel>Employee</InputLabel>
            <Select value={selectedEmpId} label="Employee" onChange={(e) => setSelectedEmpId(e.target.value)}>
              {employees.map((emp) => (
                <MenuItem key={emp.emp_id} value={emp.emp_id}>{emp.emp_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Skill</InputLabel>
            <Select value={selectedSkillId} label="Skill" onChange={(e) => setSelectedSkillId(e.target.value)}>
              {skills.map((skill) => (
                <MenuItem key={skill.skill_id} value={skill.skill_id}>{skill.skill_name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField fullWidth margin="normal" label="Score" type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: e.target.value })} />

          <FormControl fullWidth margin="normal">
            <InputLabel>Quarter</InputLabel>
            <Select value={formData.quarter} label="Quarter" onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}>
              <MenuItem value="Q1">Q1</MenuItem>
              <MenuItem value="Q2">Q2</MenuItem>
              <MenuItem value="Q3">Q3</MenuItem>
              <MenuItem value="Q4">Q4</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth margin="normal" label="Year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} />
          <TextField fullWidth margin="normal" label="Comment" multiline rows={3} value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setModalOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
            <Button variant="outlined" fullWidth onClick={resetForm} sx={{ textTransform: "none" }}>Clear</Button>
            <Button variant="contained" fullWidth onClick={handleSubmit} sx={{ bgcolor: "black", textTransform: "none" }}>Add</Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" gutterBottom>Edit Evaluation</Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Score"
            type="number"
            value={editData?.score || ""}
            onChange={(e) => setEditData({ ...editData, score: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Quarter</InputLabel>
            <Select
              value={editData?.quarter || ""}
              label="Quarter"
              onChange={(e) => setEditData({ ...editData, quarter: e.target.value })}
            >
              <MenuItem value="Q1">Q1</MenuItem>
              <MenuItem value="Q2">Q2</MenuItem>
              <MenuItem value="Q3">Q3</MenuItem>
              <MenuItem value="Q4">Q4</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="Year"
            type="number"
            value={editData?.year || ""}
            onChange={(e) => setEditData({ ...editData, year: e.target.value })}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Comment"
            multiline
            rows={3}
            value={editData?.comment || ""}
            onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleUpdate}
              sx={{ bgcolor: 'black' }}
            >
              Update
            </Button>
          </Box>
        </Box>
      </Modal>

      <ToastContainer position="top-right" autoClose={500} hideProgressBar={false} closeOnClick pauseOnHover={false} />
    </Container>
  );
};