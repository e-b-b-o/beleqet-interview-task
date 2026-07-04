const email = `testuser_${Date.now()}@example.com`;
const password = 'Password123!';

async function testFlow() {
  try {
    // 1. Register User
    console.log(`[1] Registering user ${email}`);
    const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName: 'Test',
        lastName: 'User',
        role: 'JOB_SEEKER'
      })
    });
    
    if (!regRes.ok) {
        console.error('Registration failed:', await regRes.text());
        return;
    }
    
    const regData = await regRes.json();
    const token = regData.accessToken;
    console.log(`[+] Registered successfully. JWT obtained.`);

    // 2. Add skills and bio to profile so AI has something to analyze
    console.log(`[2] Updating profile with skills and bio`);
    await fetch('http://localhost:4000/api/v1/users/profile', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            bio: 'I am a passionate software engineer with 2 years of experience.',
            headline: 'Software Engineer',
            skills: ['JavaScript', 'Node.js', 'React']
        })
    });

    // 3. Request Profile Boost
    console.log(`[3] Requesting Profile Boost`);
    const boostRes = await fetch('http://localhost:4000/api/v1/profile-boost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetJobTitle: 'Senior Full Stack Developer',
        focusArea: 'Architecture and Leadership'
      })
    });
    
    console.log(`[+] Boost Response Status: ${boostRes.status}`);
    console.log(`[+] Boost Response Data:`, await boostRes.text());

    // 4. Wait a few seconds for the background queue to process
    console.log(`[4] Waiting for queue to process... (10s)`);
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 5. Check Notifications
    console.log(`[5] Checking Notifications`);
    const notifRes = await fetch('http://localhost:4000/api/v1/users/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`[+] Notifications:`, await notifRes.json());
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testFlow();
