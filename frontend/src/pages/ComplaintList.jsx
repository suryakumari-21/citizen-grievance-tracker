import { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';


export default function ComplaintList() {
const [complaints, setComplaints] = useState([]);


useEffect(() => {
API.get('/complaints').then(res => setComplaints(res.data));
}, []);


return (
<div>
<h3>Complaints</h3>
<ul>
{complaints.map(c => (
<li key={c._id}>
<Link to={`/complaint/${c._id}`}>{c.title} - {c.status}</Link>
</li>
))}
</ul>
</div>
);
}