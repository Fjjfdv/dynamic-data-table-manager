"use client";
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,//#1   
    Button, Modal, Box, Checkbox, FormControlLabel  //#2  
    // Pagination
} from "@mui/material";
import Papa from "papaparse";

const DataTable = () => {
    const [user, setUser] = useState([]);
    // Search
    const [searchText, setSearchText] = useState("");
    // Pagination
    const [currentPage, setCurrentPage] = useState(3);
    const [postPerPage, setPostsperPage] = useState(10);
    // Sorting
    const [sort, setSort] = useState({
        key: null, direction: "asc"
    })
    // papaParse
    const [openModel, setopenModel] = useState(false);
    // Manage Columns modal ke andar checkboxes add krne ke liye 
    const [visibleColumns, setVisibleColumns] = useState({
        name: true, email: true, age: true, role: true,
    });
    const [customColumns, setCustomColumns] = useState([]);
    const [newColumnName, setNewColumnName] = useState("");

    const sorthandler = (key) => {
        let direction = 'asc';
        if (sort.key == key && sort.direction == "asc") {
            direction = "desc";
        }
        setSort({ key, direction });
    };
    const getValue = (u, key) => {
        if (key == "name") return `${u.firstName} ${u.lastName}`.toLowerCase();
        if (key == "email") return u.email.toLowerCase();
        if (key == "age") return u.age;
        if (key == "role") return u.company.title.toLowerCase();
    }

    const filteredUser = user.filter((u) => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        return (
            fullName.includes(searchText.toLowerCase()) ||
            u.email.toLowerCase().includes(searchText.toLowerCase()) || u.age.toString().includes(searchText) ||
            u.company.title.toLowerCase().includes(searchText.toLowerCase())
        );
    });

    // checkBox  // Save visible columns to localstorage 
    const handleColumnToggle = (coulmn) => {
        const update = {
            ...visibleColumns,
            [coulmn]: !visibleColumns[coulmn],
            // Example
            // [coulmn]: !visibleColumns[coulmn]
            // becomes:
            // ["name"]: !true  =>  "name": false

        };
        setVisibleColumns(update);
        localStorage.setItem("visibleColumns", JSON.stringify(update));
    };

    // Export  - CSV
    const handleExport = () => {
        const visibleKeys = Object.keys(visibleColumns).filter((key) => visibleColumns[key]);
        const dataToExport = user.map((u) => {
            const row = {};
            visibleKeys.forEach((key) => {
                if (key === "name") row["name"] = `${u.firstName} ${u.lastName}`;
                else if (key === "role") row["role"] = u.company.title;
                else row[key] = u[key];
            });
            return row;
        });

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "exported_users.csv";
        link.click();
    };
    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const importedData = results.data;

                // Validate header columns
                const expectedHeaders = ["firstName", "lastName", "email", "age", "company.title"];
                const actualHeaders = Object.keys(importedData[0]);

                const isValid = expectedHeaders.every(h =>
                    actualHeaders.some(ah => ah.includes(h))
                );

                if (!isValid) {
                    alert("Invalid CSV format. Required headers are: " + expectedHeaders.join(", "));
                    return;
                }

                // Format company.title into object
                const transformed = importedData.map((row) => ({
                    ...row,
                    company: { title: row["company.title"] || "N/A" },
                }));

                setUser(transformed);
                setCurrentPage(1); // Reset to first page
            },
        });
    };


    useEffect(() => {
        const storedColumns = localStorage.getItem("visibleColumns")
        if (storedColumns) {
            setVisibleColumns(JSON.parse(storedColumns));
        }
        const storedCustom = localStorage.getItem("customColumns")
        if (storedCustom) {
            setCustomColumns(JSON.parse(storedCustom));
        }
        fetch("https://dummyjson.com/users?limit=30")
            .then((res) => res.json())
            .then((data) => {
                setUser(data.users);
            })
            .catch((err) => {
                console.error("API error", err);
            })
    }, []);

    // Pagination
    const lastPostIndex = currentPage * postPerPage;
    const firstPostIndex = lastPostIndex - postPerPage;
    // sort filtered data before paginating 
    const sorteduser = [...filteredUser].sort((a, b) => {
        if (!sort.key) return 0;
        const aVal = getValue(a, sort.key);
        const bVal = getValue(b, sort.key);

        if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
        return 0;
    })
    const currentPost = sorteduser.slice(firstPostIndex, lastPostIndex);

    return (
        <>
            {/* <Button variant="outlined" onClick={() => setopenModel(true)} style={{ marginBottom: "12px" }}>Manage Columns
            </Button> <Button variant="outlined" style={{ marginBottom: "12px" }}>+ Add Column</Button> */}
            <div style={{ position: "relative", marginBottom: "12px" }}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                        padding: "8px 36px 8px 12px",  // input ke andar icon ke liye jagah
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #ccc"
                    }}
                />
                {
                    searchText && (<span onClick={() => setSearchText("")}
                        style={{
                            position: "absolute",     // span ko input ke andar position karna
                            right: "10px",            // right corner me icon set
                            top: "50%",               // vertical center
                            transform: "translateY(-50%)", // exact center alignment
                            cursor: "pointer",        // mouse hover pe pointer banega
                            color: "#888",            // halka grey icon
                            fontSize: "18px",         // thoda bada icon
                            userSelect: "none"        // text select na ho accidentally
                        }}
                    >&#x2715; {/* This is ✖ icon */}</span>)
                }
            </div>

            {/* Immport Export */}
            <Button variant="outlined" onClick={() => setopenModel(true)} style={{ marginBottom: "12px" }}>
                Manage Columns
            </Button>

            <Button variant="outlined" style={{ marginBottom: "12px", marginLeft: "10px" }} onClick={handleExport}>
                Export CSV
            </Button>
            <label htmlFor="csvInput" style={{ display: "inline-block" }}>
                <Button variant="outlined" component="span" style={{ marginLeft: "10px", marginBottom: "12px" }}>
                    Import CSV
                </Button>
                <input
                    id="csvInput"
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    style={{ display: "none" }}
                />
            </label>

            <TableContainer component={Paper}>
                <Table arial-label="user-table">
                    <TableHead>
                        <TableRow>
                            {visibleColumns.name && <TableCell onClick={() => sorthandler("name")}>
                                <strong>Name{sort.key === "name" && (sort.direction === "asc" ? "▲" : "▼")}</strong></TableCell>}
                            {visibleColumns.email && <TableCell onClick={() => sorthandler("email")}><strong>Email {sort.key === "email" && (sort.direction === "asc" ? "▲" : "▼")}</strong></TableCell>}
                            {visibleColumns.age && <TableCell onClick={() => sorthandler("age")}><strong>Age {sort.key === "age" && (sort.direction === "asc" ? "▲" : "▼")}</strong></TableCell>}
                            {visibleColumns.role && <TableCell onClick={() => sorthandler("role")}><strong>Role {sort.key === "role" && (sort.direction === "asc" ? "▲" : "▼")}</strong></TableCell>}

                            {/* Dyynamic custom column */}
                            {
                                customColumns.map((col) =>
                                    visibleColumns[col] && (
                                        <TableCell key={col}>
                                            <strong>{col}</strong>
                                        </TableCell>
                                    )
                                )
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            currentPost.map((user) => (
                                <TableRow key={user.id}>
                                    {visibleColumns.name && <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>}
                                    {visibleColumns.email && <TableCell>{user.email}</TableCell>}
                                    {visibleColumns.age && <TableCell>{user.age}</TableCell>}
                                    {visibleColumns.role && <TableCell>{user.company.title}</TableCell>}

                                    {
                                        customColumns.map((col) => visibleColumns[col] && (
                                            <TableCell key={col}>{user[col] ?? "--"}</TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination totalPosts={filteredUser.length} postPerPage={postPerPage} currentPage={currentPage}
                setCurrentPage={setCurrentPage} />

            <Modal open={openModel} onClose={() => setopenModel(false)} aria-labelledby="manage-columns">
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    width: 300,
                    borderRadius: 2,
                }}> <h3>Manage colums</h3>
                    {["name", "email", "age", "role", ...customColumns].map((col) => (
                        <FormControlLabel
                            key={col}
                            control={<Checkbox checked={visibleColumns[col]} onChange={() => handleColumnToggle(col)}
                            />}
                            label={col.charAt(0).toUpperCase() + col.slice(1)}
                        />
                    ))}

                    <input
                        type="text" value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="New Column Name"
                        style={{ marginTop: "10px", padding: "6px", width: "100%" }}
                    />
                    <Button
                        variant="outlined"
                        fullWidth
                        style={{ marginTop: "10px" }}
                        onClick={() => {
                            if (newColumnName && !visibleColumns.hasOwnProperty(newColumnName)) {
                                const updatedVisibleColumns = {
                                    ...visibleColumns,
                                    [newColumnName]: true,
                                };
                                const updatedCustomColumns = [...customColumns, newColumnName];

                                // Update states
                                setVisibleColumns(updatedVisibleColumns);
                                setCustomColumns(updatedCustomColumns);
                                setNewColumnName("");

                                // Update localStorage
                                localStorage.setItem("visibleColumns", JSON.stringify(updatedVisibleColumns));
                                localStorage.setItem("customColumns", JSON.stringify(updatedCustomColumns));
                            }
                        }}
                    >
                        Add Column
                    </Button>

                    {/* Export krne ke liye  */}
                    {/* <Button variant="outlined" style={{ marginBottom: "12px", marginLeft: "10px" }} onClick={handleExport}>
                        Export CSV
                    </Button>
                    <Button ><input
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        style={{ display: "inline-block", marginLeft: "10px" }}
                    />Import CSV
                    </Button> */}


                    <Button onClick={() => setopenModel(false)} variant="contained" fullWidth
                        style={{ marginTop: "20px" }} >Close</Button>
                </Box>
            </Modal>
        </>
    );
};
export default DataTable;
