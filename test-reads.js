import { fetchAdminStatsAction } from './src/app/(dashboard)/admin/actions';
import { fetchWritersAction } from './src/app/(dashboard)/admin/writers/actions';
import { fetchApplicationsAction } from './src/app/(dashboard)/admin/applications/actions';

async function testReads() {
  console.log('Testing Admin Stats...');
  const stats = await fetchAdminStatsAction();
  console.log('Stats:', stats);
  
  console.log('Testing Writers...');
  const writers = await fetchWritersAction();
  console.log('Writers:', writers);

  console.log('Testing Applications...');
  const apps = await fetchApplicationsAction();
  console.log('Apps:', apps);
}

testReads();
