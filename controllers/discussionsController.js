// controllers/discussionsController.js
"use strict";

const Discussion = require("../models/Discussion"), // 사용자 모델 요청
  getDiscussionParams = (body, user) => {
    return {
      title: body.title,
      description: body.description,
      author: user,
      category: body.category,
      tags: body.tags,
    };
  };

module.exports = {
  /**
   * =====================================================================
   * C: CREATE / 생성
   * =====================================================================
   */

  new: (req, res) => {
    res.render("discussions/new", {
      page: "new-discussion",
      title: "New Discussion",
    });
  },

  create: (req, res, next) => {
    let discussionParams = getDiscussionParams(req.body, req.user),
      discussionId = req.headers.referer.substring(
        req.headers.referer.lastIndexOf("/") + 1
      );
    // Listing 22.3 (p. 328)

    Discussion.create(discussionParams)
      .then((discussion) => {
          res.locals.redirect = "/discussions";
          res.locals.discussion = discussion;
          next();
      })
      .catch((error) => {
        console.log(`Error saving discussion: ${error.message}`);
        next(error);
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },
  // 1. new: 액션,
  // 2. create: 액션,
  // 3. redirectView: 액션,
  /**
   * =====================================================================
   * R: READ / 조회
   * =====================================================================
   */

  /**
   * ------------------------------------
   * ALL records / 모든 레코드
   * ------------------------------------
   */
  // 4. index: 액션,
    index: (req, res, next) => {
      Discussion.find() // index 액션에서만 퀴리 실행
      .populate("author") // 사용자의 토론을 가져오기 위해 populate 메소드 사용
      .exec()
      .then((discussions) => {
        // 사용자 배열로 index 페이지 렌더링
        res.locals.discussions = discussions; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching users: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },

  indexView: (req, res) => {
    res.render("discussions/index", {
      page: "discussions",
      title: "All Discussions",
    }); // 분리된 액션으로 뷰 렌더링
  },
  // 5. indexView: 엑션,
  /**
   * ------------------------------------
   * SINGLE record / 단일 레코드
   * ------------------------------------
   */
  // 6. show: 액션,
  show: (req, res, next) => {
    let discussionId = req.params.id; // request params로부터 사용자 ID 수집
    Discussion.findById(discussionId) // ID로 사용자 찾기
      .populate("author")
      .populate("comments")  
      .then((discussion) => {
        discussion.views++;
        discussion.save();
        res.locals.discussion = discussion;
        next();
      })
      .catch((error) => {
        console.log(`Error fetching discussion by ID: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },

  showView: (req, res) => {
    res.render("discussions/show", {
      page: "discussions-details",
      title: "discussions Details",
    });
  },
  // 7. showView: 액션,

  /**
   * =====================================================================
   * U: UPDATE / 수정
   * =====================================================================
   */
  edit: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findById(discussionId) // ID로 데이터베이스에서 사용자를 찾기 위한 findById 사용
      .populate("author")
      .populate("comments")    
      .then((discussion) => {
        res.render("discussions/edit", {
          discussion: discussion,
          page: "edit-discussion",
          title: "Edit discussion",
        }); // 데이터베이스에서 내 특정 사용자를 위한 편집 페이지 렌더링
      })
      .catch((error) => {
        console.log(`Error fetching user by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    let discussionId = req.params.id,
      discussionParams = getDiscussionParams(req.body);

    Discussion.findByIdAndUpdate(discussionId, {
      $set: discussionParams,
    }) //ID로 사용자를 찾아 단일 명령으로 레코드를 수정하기 위한 findByIdAndUpdate의 사용
      .populate("author")
      .then((discussion) => {
        res.locals.redirect = `/discussions/${discussionId}`;
        res.locals.discussion = discussion;
        next(); // 지역 변수로서 응답하기 위해 사용자를 추가하고 다음 미들웨어 함수 호출
      })
      .catch((error) => {
        console.log(`Error updating discussion by ID: ${error.message}`);
        next(error);
      });
  },

  /**
   * =====================================================================
   * D: DELETE / 삭제
   * =====================================================================
   */
  delete: (req, res, next) => {
    let discussionId = req.params.id;
    Discussion.findByIdAndRemove(discussionId) // findByIdAndRemove 메소드를 이용한 사용자 삭제
      .then(() => {
        res.locals.redirect = "/discussions";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting user by ID: ${error.message}`);
        next();
      });
  },
};

