import { BimElement } from './types';

// Mock BIM Data (Simulating a DataFrame)
export const MOCK_BIM_DATA: BimElement[] = [
  { id: '101', category: 'Structural Columns', material: 'Concrete', volume: 2.5, length: 3.0, level: 'L1' },
  { id: '102', category: 'Structural Columns', material: 'Concrete', volume: 2.5, length: 3.0, level: 'L1' },
  { id: '103', category: 'Structural Columns', material: 'Steel', volume: 1.2, length: 3.0, level: 'L1' },
  { id: '104', category: 'Walls', material: 'Brick', volume: 12.0, length: 5.0, level: 'L1' },
  { id: '105', category: 'Walls', material: 'Concrete', volume: 15.0, length: 6.0, level: 'L1' },
  { id: '106', category: 'Beams', material: 'Steel', volume: 0.8, length: 4.5, level: 'L2' },
  { id: '107', category: 'Slabs', material: 'Concrete', volume: 45.0, length: 10.0, level: 'L2' },
  { id: '108', category: 'Structural Columns', material: 'Concrete', volume: 2.4, length: 2.9, level: 'L2' },
  { id: '109', category: 'Windows', material: 'Glass', volume: 0.1, length: 1.5, level: 'L1' },
  { id: '110', category: 'Structural Columns', material: 'Steel', volume: 1.1, length: 2.8, level: 'L2' },
];

// Mock Compliance Documents (Context for RAG)
export const SAFETY_MANUAL_CONTEXT = `
DOCUMENT: Project Alpha Quality Control & Safety Manual
SECTION: 4.2 Material Non-Conformance
CONTENT: 
1. If material arrives on site and does not match specifications (e.g., wrong grade of concrete, damaged steel), the Site Supervisor must immediately issue a Non-Conformance Report (NCR).
2. The material must be tagged with a RED "Do Not Use" label and moved to the Quarantine Area defined in Site Map Zone C.
3. Photographs of the defect must be uploaded to the ERP within 4 hours.
4. If the material is critical (Structural), work in that sector must pause until the Project Engineer reviews the impact.

SECTION: 5.1 Personal Protective Equipment (PPE)
CONTENT:
1. Hard hats are mandatory at all times.
2. High-visibility vests must be worn by all personnel.
3. Safety harness is required for work above 2 meters.

SECTION: 8.4 Audit Procedures
CONTENT:
Internal audits are conducted monthly. Any Class A violation (Immediate Danger) requires immediate work stoppage.
`;
