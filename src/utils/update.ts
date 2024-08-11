import * as https from 'https';
import * as http from 'http';
import * as semver from 'semver';

export interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  };
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: any[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export interface UpgradeCheckResult {
  currentVersion: string;
  latestVersion: string;
  hasUpgrade: boolean;
  releaseDetails: GitHubRelease;
}

export function checkForUpgrade(owner: string, repo: string, currentVersion: string): Promise<UpgradeCheckResult> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/releases/latest`,
      headers: {
        'User-Agent': 'Node.js'
      }
    };


    https.get(options, (res: http.IncomingMessage) => {
      let data = '';

      res.on('data', (chunk: string) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response: GitHubRelease = JSON.parse(data);
          const latestVersion = response.tag_name?.replace('v', '');
          const hasUpgrade = semver.gt(latestVersion, currentVersion);

          const result: UpgradeCheckResult = {
            currentVersion,
            latestVersion,
            hasUpgrade,
            releaseDetails: response
          };
          if (hasUpgrade) {
            resolve(result);
          } else {
            resolve(Object.assign(result, {releaseDetails: null}));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error: Error) => {
      reject(error);
    });
  });
}

