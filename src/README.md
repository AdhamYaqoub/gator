Gator RSS CLI 🐊

Gator is a simple CLI RSS feed aggregator written in TypeScript. It allows you to follow feeds, aggregate posts, and browse them directly from the terminal.

Requirements

Node.js v22+

npm

PostgreSQL

Setup

Clone the repository:

git clone https://github.com/AdhamYaqoub/gator.git
cd gator


Install dependencies:

npm install


Configure database in a .env file:

DATABASE_URL=postgresql://<username>:<password>@localhost:5432/gator


Run migrations:

npm run migrate


Start the CLI:

npm run start <command> [args]

Commands
Users

register <username> – Create a new user

login <username> – Switch to a user

users – List all users

Feeds

addfeed "<name>" <url> – Add a feed and automatically follow it

feeds – List all feeds

follow <url> – Follow an existing feed

following – List followed feeds

unfollow <url> – Stop following a feed

Aggregation & Posts

agg <interval> – Continuously collect posts (e.g., 30s, 1m)

browse [limit] – Show latest posts (default: 2)

Example Usage
# Login as a user
npm run start login kahya

# Add feeds
npm run start addfeed "Boot.dev" https://blog.boot.dev/index.xml
npm run start addfeed "Hacker News RSS" https://hnrss.org/newest

# Follow feeds
npm run start follow https://blog.boot.dev/index.xml
npm run start follow https://hnrss.org/newest

# Start aggregator (collect posts every 1 minute)
npm run start agg 1m

# Browse latest 5 posts
npm run start browse 5

Notes

Make sure your PostgreSQL server is running and accessible.

Always login as a user before adding, following, or browsing feeds.

The aggregator saves posts to the database, so repeated agg commands will fetch only new posts.