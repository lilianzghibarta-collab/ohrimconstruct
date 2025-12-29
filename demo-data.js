// Demo Data Initialization
// This script populates localStorage with demo data for testing

function initializeDemoData() {
    // Only initialize if not already done
    if (localStorage.getItem('demoDataInitialized')) {
        // Check if sites exist, if not, add them
        const existingSites = localStorage.getItem('allSites');
        if (!existingSites || JSON.parse(existingSites).length === 0) {
            initializeDemoSites();
        }
        return;
    }
    
    // Demo Tasks
    const tasks = [
        {
            id: 1,
            title: 'Install window frames - Floor 2',
            description: 'Install all window frames on the second floor of building A3',
            assignedTo: 'worker',
            location: 'Building A3, Floor 2',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Apply exterior plaster',
            description: 'Apply plaster to exterior walls of building A3',
            assignedTo: 'worker',
            location: 'Building A3, Exterior',
            dueDate: new Date(Date.now() + 172800000).toISOString(),
            status: 'in-progress',
            priority: 'high'
        },
        {
            id: 3,
            title: 'Check construction materials',
            description: 'Verify quality and quantity of delivered materials',
            assignedTo: 'worker',
            location: 'Storage Area',
            dueDate: new Date(Date.now() + 259200000).toISOString(),
            status: 'completed',
            priority: 'medium',
            completedDate: new Date().toISOString()
        }
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Demo Construction Sites
    const sites = [
        {
            id: 'site-001',
            name: 'Residential Complex Aurora',
            address: 'Str. Florilor 45, Chișinău',
            status: 'active',
            manager: 'Ion Popescu',
            startDate: '2025-01-15',
            estimatedCompletion: '2026-06-30',
            coordinates: {
                latitude: 47.0245,
                longitude: 28.8322
            }
        },
        {
            id: 'site-002',
            name: 'Office Building Central Plaza',
            address: 'Bd. Ștefan cel Mare 123, Chișinău',
            status: 'active',
            manager: 'Maria Ionescu',
            startDate: '2025-03-01',
            estimatedCompletion: '2025-12-31',
            coordinates: {
                latitude: 47.0275,
                longitude: 28.8356
            }
        },
        {
            id: 'site-003',
            name: 'Villa Deluxe Project',
            address: 'Str. Păcii 78, Cricova',
            status: 'active',
            manager: 'Vasile Lupu',
            startDate: '2025-02-10',
            estimatedCompletion: '2025-09-15',
            coordinates: {
                latitude: 47.1389,
                longitude: 28.8611
            }
        },
        {
            id: 'site-004',
            name: 'Shopping Mall Expansion',
            address: 'Str. Armenească 33, Chișinău',
            status: 'active',
            manager: 'Elena Dumitru',
            startDate: '2025-04-01',
            estimatedCompletion: '2026-03-31',
            coordinates: {
                latitude: 47.0156,
                longitude: 28.8289
            }
        }
    ];
    localStorage.setItem('allSites', JSON.stringify(sites));
    
    // Demo Equipment
    const equipment = [
        {
            id: 'EQ-2301',
            name: 'Pneumatic Hammer',
            assignedTo: 'worker',
            assignedDate: '2025-12-01',
            condition: 'good',
            status: 'assigned'
        },
        {
            id: 'EQ-2315',
            name: 'Electric Drill',
            assignedTo: 'worker',
            assignedDate: '2025-12-26',
            condition: 'good',
            status: 'assigned'
        },
        {
            id: 'EQ-2401',
            name: 'Safety Vest',
            assignedTo: 'worker',
            assignedDate: '2025-12-01',
            condition: 'good',
            status: 'assigned'
        },
        {
            id: 'EQ-2405',
            name: 'Safety Helmet',
            assignedTo: 'worker',
            assignedDate: '2025-12-01',
            condition: 'good',
            status: 'assigned'
        }
    ];
    localStorage.setItem('equipment', JSON.stringify(equipment));
    
    // Demo Requests
    const requests = [
        {
            id: 1,
            username: 'worker',
            fullName: 'Worker Demo',
            type: 'vacation',
            startDate: '2026-01-15',
            endDate: '2026-01-20',
            reason: 'Family vacation',
            status: 'approved',
            submittedDate: '2025-12-20',
            adminComment: 'Approved. Enjoy your vacation!'
        },
        {
            id: 2,
            username: 'worker',
            fullName: 'Worker Demo',
            type: 'sick',
            startDate: '2025-12-10',
            endDate: '2025-12-11',
            reason: 'Medical appointment',
            status: 'approved',
            submittedDate: '2025-12-09',
            adminComment: 'Approved. Get well soon.'
        }
    ];
    localStorage.setItem('requests', JSON.stringify(requests));
    
    // Demo Payroll
    const payroll = [
        {
            id: 1,
            username: 'worker',
            fullName: 'Worker Demo',
            month: '2025-11',
            grossPay: 4700,
            deductions: 700,
            netPay: 4000,
            status: 'paid',
            paymentDate: '2025-12-01'
        },
        {
            id: 2,
            username: 'worker',
            fullName: 'Worker Demo',
            month: '2025-10',
            grossPay: 5200,
            deductions: 800,
            netPay: 4400,
            status: 'paid',
            paymentDate: '2025-11-01'
        },
        {
            id: 3,
            username: 'worker',
            fullName: 'Worker Demo',
            month: '2025-09',
            grossPay: 4600,
            deductions: 700,
            netPay: 3900,
            status: 'paid',
            paymentDate: '2025-10-01'
        }
    ];
    localStorage.setItem('payroll', JSON.stringify(payroll));
    
    // Mark as initialized
    localStorage.setItem('demoDataInitialized', 'true');
    console.log('✅ Demo data initialized successfully!');
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDemoData);
} else {
    initializeDemoData();
}

// Separate function to initialize demo sites
function initializeDemoSites() {
    const sites = [
        {
            id: 'site-001',
            name: 'Residential Complex Aurora',
            address: 'Str. Florilor 45, Chișinău',
            status: 'active',
            manager: 'Ion Popescu',
            startDate: '2025-01-15',
            estimatedCompletion: '2026-06-30',
            coordinates: {
                latitude: 47.0245,
                longitude: 28.8322
            }
        },
        {
            id: 'site-002',
            name: 'Office Building Central Plaza',
            address: 'Bd. Ștefan cel Mare 123, Chișinău',
            status: 'active',
            manager: 'Maria Ionescu',
            startDate: '2025-03-01',
            estimatedCompletion: '2025-12-31',
            coordinates: {
                latitude: 47.0275,
                longitude: 28.8356
            }
        },
        {
            id: 'site-003',
            name: 'Villa Deluxe Project',
            address: 'Str. Păcii 78, Cricova',
            status: 'active',
            manager: 'Vasile Lupu',
            startDate: '2025-02-10',
            estimatedCompletion: '2025-09-15',
            coordinates: {
                latitude: 47.1389,
                longitude: 28.8611
            }
        },
        {
            id: 'site-004',
            name: 'Shopping Mall Expansion',
            address: 'Str. Armenească 33, Chișinău',
            status: 'active',
            manager: 'Elena Dumitru',
            startDate: '2025-04-01',
            estimatedCompletion: '2026-03-31',
            coordinates: {
                latitude: 47.0156,
                longitude: 28.8289
            }
        }
    ];
    localStorage.setItem('allSites', JSON.stringify(sites));
    console.log('✅ Demo sites initialized successfully!');
}
