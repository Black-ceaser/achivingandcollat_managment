const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Mock database
const documents = [
    { id: 1, clientName: 'John Doe', loanId: 'L001', docType: 'Collateral_Doc', loanAmount: 5000, fileName: 'document1.pdf' },
    { id: 2, clientName: 'Jane Smith', loanId: 'L002', docType: 'Loan_Doc', loanAmount: 10000, fileName: 'document2.pdf' }
];

// Middleware to parse form data 
app.use(express.urlencoded({ extended: true }));

// Serve static files (for downloads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Search Page
app.get('/', (req, res) => {
    res.send(`
        <html lang="en">
        <head>
            <title>Search Documents</title>
        </head>
        <body>
            <h1>Search Documents</h1>
            <form action="/search" method="POST">
                <label>Client Name:</label>
                <input type="text" name="clientName" placeholder="Enter client name" required>

                <label>Document Type:</label>
                <select name="docType">
                    <option value="">Select Document Type</option>
                    <option value="Collateral_Doc">Collateral Document</option>
                    <option value="Loan_Doc">Loan Document</option>
                </select>
                <button type="submit">Search</button>
            </form>
        </body>
        </html>
    `);
});

// Handle Search Request
app.post('/search', (req, res) => {
    const { clientName, docType } = req.body;

    // Filter documents by clientName and docType
    const filteredDocs = documents.filter(doc => 
        doc.clientName.toLowerCase().includes(clientName.toLowerCase()) &&
        (!docType || doc.docType === docType)
    );

    let resultHTML = '<h2>Search Results</h2>';
    if (filteredDocs.length === 0) {
        resultHTML += '<p>No matching documents found.</p>';
    } else {
        resultHTML += '<table border="1"><tr><th>ID</th><th>Client Name</th><th>Loan ID</th><th>Document Type</th><th>Loan Amount</th><th>File Name</th><th>Actions</th></tr>';

        filteredDocs.forEach(doc => {
            resultHTML += `
                <tr>
                    <td>${doc.id}</td>
                    <td>${doc.clientName}</td>
                    <td>${doc.loanId}</td>
                    <td>${doc.docType}</td>
                    <td>${doc.loanAmount}</td>
                    <td>${doc.fileName}</td>
                    <td><a href="/download/${doc.id}">Download</a></td>
                </tr>
            `;
        });

        resultHTML += '</table>';
    }

    resultHTML += '<a href="/">Back to Search</a>';
    res.send(resultHTML);
});

// Handle Document Download
app.get('/download/:id', (req, res) => {
    const docId = parseInt(req.params.id);
    const document = documents.find(doc => doc.id === docId);

    if (!document) {
        return res.status(404).send('Document not found');
    }

    const filePath = path.join(__dirname, 'uploads', document.fileName);
    res.download(filePath, document.fileName);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
