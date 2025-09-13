"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Department {
    id: number
    name: string
    code: string
}

interface Student {
    id: number
    first_name: string
    last_name: string
    enrollment_no: string
}

export default function ApiTestPage() {
    const [depts, setDepts] = useState<Department[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true)
                setError(null)

                const d = await api.get<Department[]>("/departments/")
                if (d.success) setDepts(d.data)

                const s = await api.get<Student[]>("/students/")
                if (s.success) setStudents(s.data)
            } catch (e: any) {
                setError(e?.message ?? "Request failed")
            } finally {
                setLoading(false)
            }
        }
        run()
    }, [])

    return (
        <div style={{ padding: 24 }}>
            <h1>API Test</h1>
            <p>Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"}</p>
            {loading && <p>Loading...</p>}
            {error && (
                <p style={{ color: "red" }}>Error: {error}</p>
            )}
            <section style={{ marginTop: 16 }}>
                <h2>Departments ({depts.length})</h2>
                <ul>
                    {depts.map((d) => (
                        <li key={d.id}>
                            {d.code} - {d.name}
                        </li>
                    ))}
                </ul>
            </section>
            <section style={{ marginTop: 16 }}>
                <h2>Students ({students.length})</h2>
                <ul>
                    {students.map((s) => (
                        <li key={s.id}>
                            {s.enrollment_no} - {s.first_name} {s.last_name}
                        </li>
                    ))}
                </ul>
            </section>
            <p style={{ marginTop: 24, color: "#666" }}>
                Tip: Ensure localStorage has authToken and the backend is running.
            </p>
        </div>
    )
}
