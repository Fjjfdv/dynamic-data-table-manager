import { Margin } from "@mui/icons-material";
import React from "react";

const Pagination = ({ totalPosts, postPerPage, currentPage, setCurrentPage }) => {
    let pages = [];
    for (let i = 1; i <= Math.ceil(totalPosts / postPerPage); i++) {
        pages.push(i);
    }
    return (
        <div style={{ marginTop: "20px" }}>
            {pages.map((page, index) => (
                <button key={index} onClick={() => setCurrentPage(page)}
                    style={{
                        margin: "0 5px",
                        padding: "8px 12px",
                        backgroundColor: currentPage === page ? "#1976d2" : "#eee",
                        color: currentPage === page ? "#fff" : "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >{page}</button>
            ))}
        </div>
    )
}
export default Pagination;