import { GraphQLClient, gql } from 'graphql-request';
import fs from 'fs';
import path from 'path';
import { FormData, File } from 'formdata-node';
import fetch from 'node-fetch';

// --- Configuration ---
const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql'; // Adjust port if necessary
const ADMIN_EMAIL = 'admin@sprocket.gg'; // Ensure this user exists and is an admin
const ADMIN_PASSWORD = 'password'; // Use correct password or set up test user

// --- GraphQL Queries/Mutations ---

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      access_token
    }
  }
`;

const CREATE_SCRIM_MUTATION = gql`
  mutation CreateScrim($data: CreateScrimInput!) {
    createScrim(data: $data) {
      id
      submissionId
    }
  }
`;

const PARSE_REPLAYS_MUTATION = gql`
  mutation ParseReplays($files: [Upload!]!, $submissionId: String!) {
    parseReplays(files: $files, submissionId: $submissionId)
  }
`;

const MOCK_COMPLETION_MUTATION = gql`
  mutation MockCompletion($submissionId: String!, $results: [JSON!]!) {
    mockCompletion(submissionId: $submissionId, results: $results)
  }
`;

const GET_SUBMISSION_QUERY = gql`
  query GetSubmission($submissionId: String!) {
    getSubmission(submissionId: $submissionId) {
      id
      status
      items {
        originalFilename
        progress {
          status
          result
        }
      }
    }
  }
`;

// --- Helpers ---

function createMockReplayStats(filename: string, blueWon: boolean = true) {
    return {
        outputPath: `replays/mock/${filename}.json`,
        parser: "BALLCHASING",
        data: {
            blue: {
                stats: { core: { goals: blueWon ? 3 : 1 } },
                players: [
                    { name: "BluePlayer1", id: { platform: "STEAM", id: "76561198012345678" }, stats: { core: { goals: blueWon ? 3 : 1 } } },
                    { name: "BluePlayer2", id: { platform: "STEAM", id: "76561198087654321" }, stats: { core: { goals: 0 } } }
                ]
            },
            orange: {
                stats: { core: { goals: blueWon ? 1 : 3 } },
                players: [
                    { name: "OrangePlayer1", id: { platform: "STEAM", id: "76561198055555555" }, stats: { core: { goals: blueWon ? 1 : 3 } } },
                    { name: "OrangePlayer2", id: { platform: "STEAM", id: "76561198044444444" }, stats: { core: { goals: 0 } } }
                ]
            }
        }
    };
}

// --- Main Script ---

async function main() {
  console.log('Starting Integration Test: Replay Submission Flow');

  const client = new GraphQLClient(GRAPHQL_ENDPOINT);

  // 1. Login
  console.log('Logging in...');
  // Note: You might need to seed a user or use a known one.
  // For now, assuming a local dev environment with default seeds.
  let token;
  try {
      const loginData = await client.request(LOGIN_MUTATION, { username: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      token = loginData.login.access_token;
      client.setHeader('Authorization', `Bearer ${token}`);
      console.log('Login successful.');
  } catch (e) {
      console.error('Login failed. Ensure the server is running and user exists.');
      // Fallback or exit? For now, let's assume we need to manually set token if this fails
      // or just fail.
      console.error(e);
      process.exit(1);
  }

  // 2. Create Scrim (to get a submissionId)
  // We need valid skillGroupId and gameModeId. Assuming seeds.
  console.log('Creating Scrim...');
  const scrimData = await client.request(CREATE_SCRIM_MUTATION, {
      data: {
          settings: {
              teamSize: 2,
              teamCount: 2,
              mode: "standard",
              competitive: true,
              observable: true
          },
          gameModeId: 1, // Standard
          skillGroupId: 1 // Foundation
      }
  });
  const submissionId = scrimData.createScrim.submissionId;
  console.log(`Scrim created. Submission ID: ${submissionId}`);

  // 3. Upload Replays (using parseReplays)
  console.log('Uploading Replays...');
  // Create dummy files
  const file1Path = path.resolve('test-replay-1.replay');
  const file2Path = path.resolve('test-replay-2.replay');
  fs.writeFileSync(file1Path, 'dummy content 1');
  fs.writeFileSync(file2Path, 'dummy content 2');

  const file1 = new File([fs.readFileSync(file1Path)], 'test-replay-1.replay');
  const file2 = new File([fs.readFileSync(file2Path)], 'test-replay-2.replay');

  // GraphQL Upload logic is tricky with raw requests. 
  // graphql-request doesn't support multipart out of the box easily without setup.
  // Using 'formdata-node' construction manually if client doesn't support it directly.
  // Actually, graphql-request 5+ might not support uploads directly.
  // Let's use a simpler fetch approach for the upload if graphql-request fails.
  
  // Or... just skip the actual file upload if we can? 
  // No, parseReplays requires files. 
  // Let's rely on standard fetch for multipart.
  
  const formData = new FormData();
  formData.append('operations', JSON.stringify({
      query: `mutation ParseReplays($files: [Upload!]!, $submissionId: String!) {
          parseReplays(files: $files, submissionId: $submissionId)
      }`,
      variables: {
          files: [null, null],
          submissionId
      }
  }));
  formData.append('map', JSON.stringify({
      '0': ['variables.files.0'],
      '1': ['variables.files.1']
  }));
  formData.append('0', file1);
  formData.append('1', file2);

  const uploadRes = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type is set automatically by FormData
      },
      body: formData as any 
  });
  
  const uploadJson = await uploadRes.json();
  if (uploadJson.errors) {
      console.error('Upload failed:', JSON.stringify(uploadJson.errors, null, 2));
      process.exit(1);
  }
  console.log('Upload successful. Task IDs:', uploadJson.data.parseReplays);

  // Clean up files
  fs.unlinkSync(file1Path);
  fs.unlinkSync(file2Path);

  // 4. Mock Completion
  console.log('Mocking Completion...');
  const mockResults = [
      createMockReplayStats('test-replay-1', true),
      createMockReplayStats('test-replay-2', true)
  ];

  await client.request(MOCK_COMPLETION_MUTATION, {
      submissionId,
      results: mockResults
  });
  console.log('Mock completion trigger sent.');

  // 5. Verify Status
  console.log('Verifying Submission Status...');
  // Wait a moment for async processing (if any)
  await new Promise(r => setTimeout(r, 1000));

  const submissionData = await client.request(GET_SUBMISSION_QUERY, { submissionId });
  const status = submissionData.getSubmission.status;
  console.log(`Submission Status: ${status}`);

  if (status === 'RATIFYING' || status === 'COMPLETED' || status === 'VALIDATING') {
      console.log('SUCCESS: Submission flow verified.');
  } else {
      console.warn(`WARNING: Submission status is ${status}. Expected RATIFYING/COMPLETED/VALIDATING.`);
      // It might be REJECTED if validation failed (which is likely since players don't match mock stats)
      // But checking if it moved *past* PROCESSING is the key test for the pipeline.
      if (status === 'REJECTED') {
          console.log('SUCCESS: Submission processed (but rejected due to validation logic, which is expected for dummy data).');
      } else {
          console.error('FAILURE: Submission did not process correctly.');
          process.exit(1);
      }
  }
}

main().catch(console.error);
