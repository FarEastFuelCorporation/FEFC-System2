// controllers/othersController.js

async function homeController (req, res) {
    try {
        // Access the session variable
        const username = req.session.username || 'Guest';

        // Render the 'home' view and pass the session data
        const viewsData = {
            pageTitle: 'FAR EAST FUEL CORPORATION',
            username,
        };
        res.render('home', viewsData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function logoutController (req, res) {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                // Redirect to the login page after successful logout
                res.redirect('/login');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function validateQuotation (req, res) {
    try {
        var currentPage, totalPages, entriesPerPage, searchQuery
        const quotationCode = req.params.quotationCode;
        const revisionNumber = req.params.revisionNumber;
        const typesOfWastes = await TypeOfWaste.findAll();
        const vehicleTypes = await VehicleType.findAll();
        const quotation = await Quotation.findAll({
            where: { quotationCode, revisionNumber },
            include: [
                { model: Client, as: 'Client' },
                { model: QuotationWaste, as: 'QuotationWaste',
                    include: [ 
                        { model: TypeOfWaste, as: 'TypeOfWaste' },
                    ],
                },
                { model: QuotationTransportation, as: 'QuotationTransportation',
                    include: [ 
                        { model: VehicleType, as: 'VehicleType' },
                    ], 
                },
                { model: Employee, as: 'Employee' }
            ],
        });

        // Function to convert a string to proper case
        function toProperCase(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        // Apply the function to the employee's first and last names
        const employeeName = `${toProperCase(quotation[0]?.Employee.firstName)} ${toProperCase(quotation[0]?.Employee.lastName)}`;
        const employeeSignature = quotation[0]?.Employee.picture.replace(/\.jpg$/, '.png');

        // Render the dashboard view with data
        const viewsData = {
            pageTitle: 'Marketing User - Update Quotation Form',
            sidebar: 'marketing/marketing_sidebar',
            content: 'marketing/update_quotation',
            route: 'marketing_dashboard',
            general_scripts: 'marketing/marketing_scripts',
            currentPage,
            totalPages,
            entriesPerPage,
            searchQuery,
            employeeName,
            employeeSignature,
            quotation,
            typesOfWastes,
            vehicleTypes,
        };
        res.render('validate_quotation', viewsData);
    } catch (error) {
        console.error('Error in getUpdateQuotationController:', error);
        // Handle the error appropriately (e.g., send an error response)
        res.status(500).send('Internal Server Error');
    }
}

async function error404Controller (req, res, next) {
    res.status(404).send('404 Not Found');
}



module.exports = { homeController, logoutController, validateQuotation, error404Controller };