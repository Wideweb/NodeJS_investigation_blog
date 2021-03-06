const DB = require('../config/constants');

const dataBase = require('../database/database')(DB.BLOG, 'admin', '123456', {
        host: 'RUKAVITSINI',
        port: 1543,
        dialect: 'mssql'
    }),
    blog = {
      USERS:{},
      POSTS:{},
      COMMENTS:{}
    };

blog.USERS.getUserByCredentials = (username,password) =>{
  return dataBase(
            `SELECT ${DB.columns.BLOG.USERS.USER_ID},
                    ${DB.columns.BLOG.USERS.NAME},
                    ${DB.columns.BLOG.USERS.EMAIL},
                    ${DB.columns.BLOG.USERS.PASSWORD}
            FROM ${DB.tables.BLOG.USERS}
            WHERE ${DB.columns.BLOG.USERS.NAME}='${username}'
                  and ${DB.columns.BLOG.USERS.PASSWORD}='${password}'`
          );
}

blog.POSTS.addPost = (title,content) => {
  dataBase(`DECLARE @TranName VARCHAR(20);
            SELECT @TranName = 'AddPost';
            BEGIN TRANSACTION @TranName
                DECLARE @CurrentPostID int;
                INSERT INTO [${DB.tables.BLOG.POSTS}] (${DB.columns.BLOG.POSTS.TITLE},
                   [${DB.columns.BLOG.POSTS.DATE}],
                   ${DB.columns.BLOG.POSTS.OWNER_ID})
                VALUES (
                   '${title}',
                   GETDATE(),
                   ${global.User.id});
                SELECT @CurrentPostID = SCOPE_IDENTITY();
                INSERT INTO [${DB.tables.BLOG.POST_DETAILS}] (${DB.columns.BLOG.POST_DETAILS.POST_ID},
                   ${DB.columns.BLOG.POST_DETAILS.CONTENT})
                VALUES (
                  @CurrentPostID,
                  '${content}'
                );
            COMMIT TRANSACTION @TranName`);
}

blog.POSTS.getCurrentUserLatestPosts = () => {
  return dataBase(`
    SELECT TOP ${DB.POST_NUMBER} ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.POST_ID}
    FROM ${DB.tables.BLOG.POSTS}
    WHERE ${DB.columns.BLOG.POSTS.OWNER_ID} = ${global.User.id}
    ORDER BY ${DB.columns.BLOG.POSTS.DATE} DESC`);
}

blog.POSTS.getOtherUsersLatestPosts = () => {
  return dataBase(`
    SELECT TOP ${DB.POST_NUMBER} ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.POST_ID}, ${DB.columns.BLOG.USERS.NAME}
    FROM ${DB.tables.BLOG.POSTS}, ${DB.tables.BLOG.USERS}
    WHERE ${DB.columns.BLOG.POSTS.OWNER_ID} <> ${global.User.id}
    and ${DB.columns.BLOG.POSTS.OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}
    ORDER BY ${DB.columns.BLOG.POSTS.DATE} DESC`);
}

blog.POSTS.getPostById = (id) => {
  return dataBase(`
      SELECT ${DB.columns.BLOG.POSTS.TITLE}, ${DB.columns.BLOG.POSTS.DATE}, ${DB.columns.BLOG.POST_DETAILS.CONTENT}, ${DB.columns.BLOG.POST_DETAILS.DETAIL_ID}, ${DB.columns.BLOG.USERS.NAME}
      FROM ${DB.tables.BLOG.POSTS}, ${DB.tables.BLOG.POST_DETAILS}, ${DB.tables.BLOG.USERS}
      WHERE ${DB.tables.BLOG.POSTS}.${DB.columns.BLOG.POSTS.POST_ID} = ${id}
      and ${DB.tables.BLOG.POST_DETAILS}.${DB.columns.BLOG.POST_DETAILS.POST_ID} = ${id}
      and ${DB.tables.BLOG.POSTS}.${DB.columns.BLOG.POSTS.OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}`);
}

blog.COMMENTS.getCommentsForPostByDetailId = (id) => {
  return dataBase(`
      SELECT ${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT}, ${DB.columns.BLOG.COMMENTS.DATE}, ${DB.columns.BLOG.USERS.NAME}
      FROM ${DB.tables.BLOG.COMMENTS}, ${DB.tables.BLOG.USERS}
      WHERE ${DB.tables.BLOG.COMMENTS}.${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID} = ${id}
      and ${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID} = ${DB.columns.BLOG.USERS.USER_ID}`);
}

blog.COMMENTS.addComment = (comment, ownerId, detailId) => {
  console.log(comment, ownerId, detailId);
  return dataBase(`
      INSERT INTO ${DB.tables.BLOG.COMMENTS} (${DB.columns.BLOG.COMMENTS.COMMENT_CONTENT},
       ${DB.columns.BLOG.COMMENTS.DATE},
       ${DB.columns.BLOG.COMMENTS.COMMENT_OWNER_ID},
       ${DB.columns.BLOG.COMMENTS.POST_DETAIL_ID})
      VALUES ('${comment}', GETDATE(),${ownerId},${detailId})`);
}

module.exports = blog;

// blog.USERS.getUserByFacebookId = (id) => {
//   return dataBase(`SELECT userID,Name, facebookId FROM Users WHERE facebookId='${id}'`);
// }
//
// blog.USERS.addNewFacebookUser = (facebookId) => {
//   dataBase(`INSERT INTO Users (facebookId) VALUES (${facebookId})`);
// }
