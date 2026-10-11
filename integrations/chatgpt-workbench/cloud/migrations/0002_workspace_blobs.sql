CREATE TABLE IF NOT EXISTS workspace_blobs (
  owner TEXT NOT NULL,
  digest TEXT NOT NULL,
  state TEXT NOT NULL CHECK(json_valid(state)),
  PRIMARY KEY(owner,digest)
);
