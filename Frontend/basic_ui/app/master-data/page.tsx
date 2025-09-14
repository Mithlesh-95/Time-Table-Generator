"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import {
    CssBaseline,
    Box,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    List,
    ListItem,
    ListItemText,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Chip,
    Card,
    CardContent,
    CardActions,
    Divider,
    Input
} from "@mui/material"
import {
    Add as AddIcon,
    Upload as UploadIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    Groups as GroupsIcon,
    Room as RoomIcon,
    Book as BookIcon,
    Class as ClassIcon
} from "@mui/icons-material"
import Navigation from "@/components/Navigation"
import { masterDataApi } from "@/lib/api/masterData"
import type { Department, Faculty, Student, Room, Subject, Section } from "@/types/master-data"

const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
})

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    )
}

export default function MasterDataPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [tabValue, setTabValue] = useState(0)
    const hasLoadedRef = useRef(false)

    // Individual loading states for better UX
    const [loadingStates, setLoadingStates] = useState({
        departments: false,
        rooms: false,
        faculty: false,
        students: false,
        subjects: false,
        sections: false,
        bulkUpload: false,
        initialLoad: true
    })

    const [departments, setDepartments] = useState<Department[]>([])
    const [faculty, setFaculty] = useState<Faculty[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [sections, setSections] = useState<Section[]>([])

    // Forms state
    const [deptForm, setDeptForm] = useState<Department>({ name: "", code: "" })
    const [roomForm, setRoomForm] = useState<Room>({ number: "", room_type: "lecture", capacity: 40 })
    const [facultyForm, setFacultyForm] = useState<Faculty>({ first_name: "", last_name: "", email: "", department_id: 0 })
    const [studentForm, setStudentForm] = useState<Student>({ first_name: "", last_name: "", email: "", enrollment_no: "", department_id: 0, current_semester: "Sem-1" })
    const [subjectForm, setSubjectForm] = useState<Subject>({ code: "", name: "", category: "Major", credits_theory: 3, credits_practical: 0 })
    const [sectionForm, setSectionForm] = useState<Section>({ department_id: 0, semester: "Sem-1", name: "A", size: 60 })

    const deptOptions = useMemo(() => departments.map(d => ({ value: d.id!, label: `${d.code} - ${d.name}` })), [departments])

    const refreshAll = async () => {
        setLoadingStates(prev => ({ ...prev, initialLoad: true }))
        setLoading(true); setError(null)
        try {
            const [d, f, s, r, sub, sec] = await Promise.all([
                masterDataApi.listDepartments(),
                masterDataApi.listFaculty(),
                masterDataApi.listStudents(),
                masterDataApi.listRooms(),
                masterDataApi.listSubjects(),
                masterDataApi.listSections(),
            ])
            if (d.success) setDepartments(d.data)
            if (f.success) setFaculty(f.data)
            if (s.success) setStudents(s.data)
            if (r.success) setRooms(r.data)
            if (sub.success) setSubjects(sub.data)
            if (sec.success) setSections(sec.data)
        } catch (e: any) {
            setError(e?.message ?? "Failed to load master data")
        } finally {
            setLoading(false)
            setLoadingStates(prev => ({ ...prev, initialLoad: false }))
        }
    }

    // Selective refresh functions for better performance
    const refreshDepartments = async () => {
        const res = await masterDataApi.listDepartments()
        if (res.success) setDepartments(res.data)
    }

    const refreshRooms = async () => {
        const res = await masterDataApi.listRooms()
        if (res.success) setRooms(res.data)
    }

    const refreshFaculty = async () => {
        const res = await masterDataApi.listFaculty()
        if (res.success) setFaculty(res.data)
    }

    const refreshStudents = async () => {
        const res = await masterDataApi.listStudents()
        if (res.success) setStudents(res.data)
    }

    const refreshSubjects = async () => {
        const res = await masterDataApi.listSubjects()
        if (res.success) setSubjects(res.data)
    }

    const refreshSections = async () => {
        const res = await masterDataApi.listSections()
        if (res.success) setSections(res.data)
    }

    useEffect(() => {
        if (!hasLoadedRef.current) {
            hasLoadedRef.current = true
            refreshAll()
        }
    }, [])

    // Handlers
    const onCreateDepartment = async () => {
        if (!deptForm.name || !deptForm.code) return
        setLoadingStates(prev => ({ ...prev, departments: true }))
        try {
            const res = await masterDataApi.createDepartment(deptForm)
            if (res.success) {
                setDeptForm({ name: "", code: "" })
                refreshDepartments()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create department") } finally { 
            setLoadingStates(prev => ({ ...prev, departments: false }))
        }
    }

    const onCreateRoom = async () => {
        if (!roomForm.number || !roomForm.capacity) return
        setLoadingStates(prev => ({ ...prev, rooms: true }))
        try {
            const res = await masterDataApi.createRoom(roomForm)
            if (res.success) {
                setRoomForm({ number: "", room_type: "lecture", capacity: 40 })
                refreshRooms()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create room") } finally { 
            setLoadingStates(prev => ({ ...prev, rooms: false }))
        }
    }

    const onCreateFaculty = async () => {
        if (!facultyForm.first_name || !facultyForm.email || !facultyForm.department_id) return
        setLoadingStates(prev => ({ ...prev, faculty: true }))
        try {
            const res = await masterDataApi.createFaculty(facultyForm)
            if (res.success) {
                setFacultyForm({ first_name: "", last_name: "", email: "", department_id: 0 })
                refreshFaculty()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create faculty") } finally { 
            setLoadingStates(prev => ({ ...prev, faculty: false }))
        }
    }

    const onCreateStudent = async () => {
        if (!studentForm.first_name || !studentForm.email || !studentForm.department_id || !studentForm.enrollment_no) return
        setLoadingStates(prev => ({ ...prev, students: true }))
        try {
            const res = await masterDataApi.createStudent(studentForm)
            if (res.success) {
                setStudentForm({ first_name: "", last_name: "", email: "", enrollment_no: "", department_id: 0, current_semester: "Sem-1" })
                refreshStudents()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create student") } finally { 
            setLoadingStates(prev => ({ ...prev, students: false }))
        }
    }

    const onCreateSubject = async () => {
        if (!subjectForm.code || !subjectForm.name) return
        setLoadingStates(prev => ({ ...prev, subjects: true }))
        try {
            const res = await masterDataApi.createSubject(subjectForm)
            if (res.success) {
                setSubjectForm({ code: "", name: "", category: "Major", credits_theory: 3, credits_practical: 0 })
                refreshSubjects()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create subject") } finally { 
            setLoadingStates(prev => ({ ...prev, subjects: false }))
        }
    }

    const onCreateSection = async () => {
        if (!sectionForm.department_id || !sectionForm.name) return
        setLoadingStates(prev => ({ ...prev, sections: true }))
        try {
            const res = await masterDataApi.createSection(sectionForm)
            if (res.success) {
                setSectionForm({ department_id: 0, semester: "Sem-1", name: "A", size: 60 })
                refreshSections()
            }
        } catch (e: any) { setError(e?.message ?? "Failed to create section") } finally { 
            setLoadingStates(prev => ({ ...prev, sections: false }))
        }
    }

    const handleBulkUpload = async (file: File, type: 'faculty' | 'students') => {
        setLoadingStates(prev => ({ ...prev, bulkUpload: true }))
        try {
            if (type === 'faculty') {
                await masterDataApi.bulkUploadFaculty(file)
                await refreshFaculty()
            } else {
                await masterDataApi.bulkUploadStudents(file)
                await refreshStudents()
            }
        } catch (e: any) {
            setError(e?.message ?? `Failed to upload ${type}`)
        } finally {
            setLoadingStates(prev => ({ ...prev, bulkUpload: false }))
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon />
                        Master Data Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Add and manage Departments, Faculty, Students, Rooms, Subjects, and Sections for your institution.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    
                    {/* Initial Loading Overlay */}
                    {loadingStates.initialLoad && (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                minHeight: 400,
                                gap: 2 
                            }}
                        >
                            <CircularProgress size={60} thickness={4} />
                            <Typography variant="h6" color="text.secondary">
                                Loading Master Data...
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Please wait while we fetch departments, faculty, students, and other data.
                            </Typography>
                        </Box>
                    )}

                    {/* Main Content - only show when not loading initially */}
                    {!loadingStates.initialLoad && (

                    <Paper sx={{ width: '100%' }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab icon={<SchoolIcon />} label="Departments" />
                            <Tab icon={<RoomIcon />} label="Rooms" />
                            <Tab icon={<PersonIcon />} label="Faculty" />
                            <Tab icon={<GroupsIcon />} label="Students" />
                            <Tab icon={<BookIcon />} label="Subjects" />
                            <Tab icon={<ClassIcon />} label="Sections" />
                            <Tab icon={<UploadIcon />} label="Bulk Upload" />
                        </Tabs>

                        {/* Departments Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Department</Typography>
                                        <TextField
                                            fullWidth
                                            label="Department Code"
                                            value={deptForm.code}
                                            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Department Name"
                                            value={deptForm.name}
                                            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.departments ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateDepartment}
                                            disabled={loadingStates.departments}
                                        >
                                            {loadingStates.departments ? 'Adding...' : 'Add Department'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Departments ({departments.length})
                                        </Typography>
                                        {loadingStates.initialLoad ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                                <CircularProgress size={20} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Loading departments...
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <List dense>
                                                {departments.map((dept) => (
                                                    <ListItem key={dept.id}>
                                                        <ListItemText
                                                            primary={`${dept.code} - ${dept.name}`}
                                                            secondary={`ID: ${dept.id}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                                {departments.length === 0 && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                                                        No departments found. Add one to get started.
                                                    </Typography>
                                                )}
                                            </List>
                                        )}
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Rooms Tab */}
                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Room</Typography>
                                        <TextField
                                            fullWidth
                                            label="Room Number"
                                            value={roomForm.number}
                                            onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Room Type</InputLabel>
                                            <Select
                                                value={roomForm.room_type}
                                                label="Room Type"
                                                onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                                            >
                                                <MenuItem value="lecture">Lecture</MenuItem>
                                                <MenuItem value="lab">Lab</MenuItem>
                                                <MenuItem value="seminar">Seminar</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Capacity"
                                            type="number"
                                            value={roomForm.capacity}
                                            onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.rooms ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateRoom}
                                            disabled={loadingStates.rooms}
                                        >
                                            {loadingStates.rooms ? 'Adding...' : 'Add Room'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Rooms ({rooms.length})
                                        </Typography>
                                        <List dense>
                                            {rooms.map((room) => (
                                                <ListItem key={room.id}>
                                                    <ListItemText
                                                        primary={`Room ${room.number}`}
                                                        secondary={`${room.room_type} - Capacity: ${room.capacity}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Faculty Tab */}
                        <TabPanel value={tabValue} index={2}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Faculty</Typography>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={facultyForm.first_name}
                                            onChange={(e) => setFacultyForm({ ...facultyForm, first_name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={facultyForm.last_name}
                                            onChange={(e) => setFacultyForm({ ...facultyForm, last_name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            value={facultyForm.email}
                                            onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                value={facultyForm.department_id}
                                                label="Department"
                                                onChange={(e) => setFacultyForm({ ...facultyForm, department_id: Number(e.target.value) })}
                                            >
                                                <MenuItem value={0}>Select Department</MenuItem>
                                                {deptOptions.map((dept) => (
                                                    <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.faculty ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateFaculty}
                                            disabled={loadingStates.faculty}
                                        >
                                            {loadingStates.faculty ? 'Adding...' : 'Add Faculty'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Faculty ({faculty.length})
                                        </Typography>
                                        <List dense>
                                            {faculty.map((f) => (
                                                <ListItem key={f.id}>
                                                    <ListItemText
                                                        primary={`${f.first_name} ${f.last_name}`}
                                                        secondary={f.email}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Students Tab */}
                        <TabPanel value={tabValue} index={3}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Student</Typography>
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            value={studentForm.first_name}
                                            onChange={(e) => setStudentForm({ ...studentForm, first_name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            value={studentForm.last_name}
                                            onChange={(e) => setStudentForm({ ...studentForm, last_name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            type="email"
                                            value={studentForm.email}
                                            onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Enrollment Number"
                                            value={studentForm.enrollment_no}
                                            onChange={(e) => setStudentForm({ ...studentForm, enrollment_no: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                value={studentForm.department_id}
                                                label="Department"
                                                onChange={(e) => setStudentForm({ ...studentForm, department_id: Number(e.target.value) })}
                                            >
                                                <MenuItem value={0}>Select Department</MenuItem>
                                                {deptOptions.map((dept) => (
                                                    <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Current Semester"
                                            value={studentForm.current_semester}
                                            onChange={(e) => setStudentForm({ ...studentForm, current_semester: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.students ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateStudent}
                                            disabled={loadingStates.students}
                                        >
                                            {loadingStates.students ? 'Adding...' : 'Add Student'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Students ({students.length})
                                        </Typography>
                                        <List dense>
                                            {students.map((s) => (
                                                <ListItem key={s.id}>
                                                    <ListItemText
                                                        primary={`${s.enrollment_no} - ${s.first_name} ${s.last_name}`}
                                                        secondary={`${s.current_semester} | ${s.email}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Subjects Tab */}
                        <TabPanel value={tabValue} index={4}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Subject</Typography>
                                        <TextField
                                            fullWidth
                                            label="Subject Code"
                                            value={subjectForm.code}
                                            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            value={subjectForm.name}
                                            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                value={subjectForm.category}
                                                label="Category"
                                                onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
                                            >
                                                <MenuItem value="Major">Major</MenuItem>
                                                <MenuItem value="Minor">Minor</MenuItem>
                                                <MenuItem value="SEC">SEC</MenuItem>
                                                <MenuItem value="VAC">VAC</MenuItem>
                                                <MenuItem value="AEC">AEC</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Theory Credits"
                                            type="number"
                                            value={subjectForm.credits_theory}
                                            onChange={(e) => setSubjectForm({ ...subjectForm, credits_theory: Number(e.target.value) })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Practical Credits"
                                            type="number"
                                            value={subjectForm.credits_practical}
                                            onChange={(e) => setSubjectForm({ ...subjectForm, credits_practical: Number(e.target.value) })}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.subjects ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateSubject}
                                            disabled={loadingStates.subjects}
                                        >
                                            {loadingStates.subjects ? 'Adding...' : 'Add Subject'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Subjects ({subjects.length})
                                        </Typography>
                                        <List dense>
                                            {subjects.map((subject) => (
                                                <ListItem key={subject.id}>
                                                    <ListItemText
                                                        primary={`${subject.code} - ${subject.name}`}
                                                        secondary={`${subject.category} | Theory: ${subject.credits_theory} | Practical: ${subject.credits_practical}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Sections Tab */}
                        <TabPanel value={tabValue} index={5}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>Add New Section</Typography>
                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Department</InputLabel>
                                            <Select
                                                value={sectionForm.department_id}
                                                label="Department"
                                                onChange={(e) => setSectionForm({ ...sectionForm, department_id: Number(e.target.value) })}
                                            >
                                                <MenuItem value={0}>Select Department</MenuItem>
                                                {deptOptions.map((dept) => (
                                                    <MenuItem key={dept.value} value={dept.value}>{dept.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            fullWidth
                                            label="Semester"
                                            value={sectionForm.semester}
                                            onChange={(e) => setSectionForm({ ...sectionForm, semester: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Section Name"
                                            value={sectionForm.name}
                                            onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Section Size"
                                            type="number"
                                            value={sectionForm.size}
                                            onChange={(e) => setSectionForm({ ...sectionForm, size: Number(e.target.value) })}
                                            sx={{ mb: 2 }}
                                        />
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            variant="contained"
                                            startIcon={loadingStates.sections ? <CircularProgress size={20} /> : <AddIcon />}
                                            onClick={onCreateSection}
                                            disabled={loadingStates.sections}
                                        >
                                            {loadingStates.sections ? 'Adding...' : 'Add Section'}
                                        </Button>
                                    </CardActions>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Existing Sections ({sections.length})
                                        </Typography>
                                        <List dense>
                                            {sections.map((section) => (
                                                <ListItem key={section.id}>
                                                    <ListItemText
                                                        primary={`${section.semester} - Section ${section.name}`}
                                                        secondary={`Size: ${section.size} students`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        {/* Bulk Upload Tab */}
                        <TabPanel value={tabValue} index={6}>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <UploadIcon />
                                            Bulk Upload Faculty
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Upload faculty data using CSV or Excel files. Make sure the file includes required columns: first_name, last_name, email, department_id.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadIcon />}
                                            disabled={loading}
                                            fullWidth
                                        >
                                            Choose Faculty File
                                            <input
                                                type="file"
                                                accept=".csv,.xlsx"
                                                hidden
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleBulkUpload(file, 'faculty')
                                                }}
                                            />
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <UploadIcon />
                                            Bulk Upload Students
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Upload student data using CSV or Excel files. Make sure the file includes required columns: first_name, last_name, email, enrollment_no, department_id, current_semester.
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<UploadIcon />}
                                            disabled={loading}
                                            fullWidth
                                        >
                                            Choose Students File
                                            <input
                                                type="file"
                                                accept=".csv,.xlsx"
                                                hidden
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) handleBulkUpload(file, 'students')
                                                }}
                                            />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                    </Paper>
                    )} {/* Close the !loadingStates.initialLoad conditional */}
                </Box>
            </Box>
        </ThemeProvider>
    )
}
