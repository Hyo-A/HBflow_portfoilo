// 전역 변수들
let isLoading = false; // 로딩 상태 추가
let isDesignTitleAnimating = false; // Design Work 제목 애니메이션 상태
let currentAnimationTimer = null; // 현재 실행 중인 애니메이션 타이머
let pendingCategoryChange = null; // 대기 중인 카테고리 변경

// 격자 라인 동적 생성 함수 (300px 간격, 정사각형 유지)
function createGridLines() {
  const gridContainer = document.querySelector(".grid-lines");

  if (!gridContainer) {
    console.error("격자 컨테이너를 찾을 수 없습니다!");
    return;
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // 기존 격자 라인 제거
  gridContainer.innerHTML = "";

  // 수평선 생성 (300px 간격, 100px 아래부터 시작)
  const horizontalCount = Math.ceil((screenHeight - 100) / 300) + 1;

  for (let i = 0; i < horizontalCount; i++) {
    const line = document.createElement("div");
    line.className = "horizontal-grid-line";
    line.style.top = `${100 + i * 300}px`; // 100px 아래부터 시작
    line.style.position = "absolute";
    line.style.width = "100%";
    line.style.height = "1px";
    line.style.backgroundColor = "var(--color-accent)";
    line.style.opacity = "0.5";
    line.style.transform = "scaleX(0)";
    line.style.transformOrigin = "left";
    gridContainer.appendChild(line);
  }

  // 수직선 생성 (300px 간격)
  const verticalCount = Math.ceil(screenWidth / 300) + 1;

  for (let i = 0; i < verticalCount; i++) {
    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.left = `${i * 300}px`;
    line.style.position = "absolute";
    line.style.width = "1px";
    line.style.height = "100%";
    line.style.backgroundColor = "var(--color-accent)";
    line.style.opacity = "0.5";
    line.style.transform = "scaleY(0)";
    line.style.transformOrigin = "top";
    gridContainer.appendChild(line);
  }
}

// 로딩 표시 후 페이지 이동 함수 (전역 함수)
function showLoadingAndNavigate(pageIndex) {
  closeModal();
  isLoading = true; // 로딩 시작

  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  // 로딩 요소들
  const preloader = document.querySelector(".preloader");
  const counter = document.querySelector(".counter");
  const progressBar = document.querySelector(".progress-bar-fill");
  const title = document.querySelector(".title");
  // 격자 라인 생성
  createGridLines();

  // 격자 라인 생성 후 선택
  const horizontalGridLines = document.querySelectorAll(
    ".horizontal-grid-line"
  );
  const verticalGridLines = document.querySelectorAll(".vertical-grid-line");

  // 로딩 표시
  preloader.style.display = "flex";
  preloader.style.opacity = "1";
  preloader.style.transform = "translateY(0)";
  preloader.style.zIndex = "1000";

  // ESC 키로 로딩 건너뛰기 기능 추가
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      tl.kill(); // 현재 애니메이션 중단
      container.scrollTo({
        top: pages[pageIndex].offsetTop,
        behavior: "auto",
      });

      setTimeout(() => {
        updateActiveNav(pageIndex, "down");
      }, 500);

      preloader.style.display = "none";
      isLoading = false;
      container.classList.remove("loading");
      setTimeout(() => {
        container.style.scrollBehavior = "smooth";
      }, 100);

      document.removeEventListener("keydown", handleEscape);
    }
  };

  document.addEventListener("keydown", handleEscape);

  // 스크롤 애니메이션 비활성화
  container.style.scrollBehavior = "auto";
  container.classList.add("loading");

  // 카운터와 타이틀 초기화
  counter.textContent = "0";
  counter.style.opacity = "0";
  counter.style.transform = "translateY(20px)";
  title.style.opacity = "0";
  title.style.transform = "translateY(20px)";

  // 그리드 라인과 점들 초기화
  horizontalGridLines.forEach((line) => {
    line.style.transform = "scaleX(0)";
  });
  verticalGridLines.forEach((line) => {
    line.style.transform = "scaleY(0)";
  });

  // 프로그레스바 초기화
  progressBar.style.width = "0";

  // GSAP 타임라인 생성
  const tl = gsap.timeline({
    onComplete: () => {
      // 로딩 완료 후 페이지 이동 (애니메이션 없음)
      container.scrollTo({
        top: pages[pageIndex].offsetTop,
        behavior: "auto",
      });

      // 페이지 이동 완료 후 네비게이션 업데이트
      setTimeout(() => {
        updateActiveNav(pageIndex, "down");
      }, 500);

      // 로딩 완전히 숨기기
      preloader.style.display = "none";
      preloader.style.transform = "translateY(0)";
      isLoading = false; // 로딩 완료

      // 스크롤 애니메이션 복원
      container.classList.remove("loading");
      setTimeout(() => {
        container.style.scrollBehavior = "smooth";
      }, 100);
    },
  });

  // 로딩 애니메이션 실행
  tl.to([counter, title], {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "power2.out",
    stagger: 0.05,
  })
    .to(
      horizontalGridLines,
      {
        scaleX: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: "power1.inOut",
      },
      "-=0.2"
    )
    .to(
      verticalGridLines,
      {
        scaleY: 1,
        duration: 0.5,
        stagger: 0.03,
        ease: "power1.inOut",
      },
      "-=0.4"
    )
    .to(
      progressBar,
      {
        width: "100%",
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: function () {
          const progress = Math.round(this.progress() * 100);
          counter.textContent = progress;
        },
      },
      "-=0.8"
    )
    .to(preloader, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      delay: 0.2,
    })
    .set(preloader, {
      display: "none",
    });
}

// 현재 페이지에 따른 네비게이션 활성화 및 프로그레스바 업데이트 (전역 함수)
function updateActiveNav(currentPage, scrollDirection = null) {
  // 모든 네비게이션 아이템에서 active 클래스 제거
  const allNavItems = document.querySelectorAll(".nav-item");

  allNavItems.forEach((item, index) => {
    item.classList.remove("active");
  });

  // 현재 페이지에 해당하는 네비게이션 아이템 활성화
  const currentNav = document.querySelector(`[data-page="${currentPage}"]`);

  if (currentNav) {
    currentNav.classList.add("active");

    // Project 하위 페이지인 경우 PROJECT도 활성화
    if (currentPage >= 2 && currentPage <= 4) {
      const projectNav = document.querySelector(".project-nav");
      if (projectNav) {
        projectNav.classList.add("active");

        // PROJECT 하위 항목들 중 현재 페이지에 해당하는 것 활성화
        const subNavItems = document.querySelectorAll(".PROJECT_li .nav-item");
        subNavItems.forEach((subItem) => {
          const subDataPage = subItem.getAttribute("data-page");
          if (subDataPage == currentPage) {
            subItem.classList.add("active");
          } else {
            subItem.classList.remove("active");
          }
        });
      }
    }
  }

  // 프로그레스바 업데이트
  updateProgressBar(currentPage);

  // Design Work 페이지(페이지 4) 애니메이션 처리
  if (currentPage === 4) {
    // 위로 스크롤할 때는 애니메이션 실행하지 않음
    if (scrollDirection === "up") {
      return;
    }

    // 애니메이션이 이미 실행 중이면 중단
    if (isDesignTitleAnimating) return;

    const mainTitle = document.querySelector(
      ".designwork-page .design-title-section .design-main-title"
    );
    const subTitle = document.querySelector(
      ".designwork-page .design-title-section .design-sub-title"
    );

    if (mainTitle && subTitle) {
      // 애니메이션 상태 설정
      isDesignTitleAnimating = true;

      // 애니메이션 초기 상태로 리셋
      mainTitle.classList.remove("animate-in");
      subTitle.classList.remove("animate-in");

      // transition을 일시적으로 비활성화하여 즉시 초기 상태 적용
      mainTitle.style.transition = "none";
      subTitle.style.transition = "none";

      // 강제로 리플로우 발생하여 초기 상태 적용
      mainTitle.offsetHeight;
      subTitle.offsetHeight;

      // transition 복원
      mainTitle.style.transition = "";
      subTitle.style.transition = "";

      // 스크롤 애니메이션 완료 후(700ms) 제목 애니메이션 시작
      setTimeout(() => {
        mainTitle.classList.add("animate-in");
        subTitle.classList.add("animate-in");

        // 애니메이션 완료 후 상태 해제
        setTimeout(() => {
          isDesignTitleAnimating = false;
        }, 600); // transition 시간과 동일
      }, 700); // 스크롤 애니메이션 완료 시간과 동일
    }
  }
}

// 프로그레스바 업데이트 함수 (전역 함수)
function updateProgressBar(currentPage) {
  const progressBar = document.querySelector(".right-green-bar");
  const pages = document.querySelectorAll(".page");
  const totalPages = pages.length;

  const progressPercentage = ((currentPage + 1) / totalPages) * 100;

  progressBar.style.height = `${progressPercentage}%`;
}

// 창 크기 변경 시 격자 재생성
window.addEventListener("resize", () => {
  if (document.querySelector(".preloader").style.display === "flex") {
    createGridLines();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  // HISTORY 바 애니메이션
  const bars = document.querySelectorAll(".history-bar .bar");

  // 페이지 로드 시 모든 바의 너비를 0으로 초기화
  bars.forEach((bar) => {
    bar.style.width = "0";
  });

  // 로딩이 완료된 후에만 애니메이션 시작하도록 설정
  let historyAnimationStarted = false;

  // 로딩 완료 후 애니메이션 시작 함수
  function startHistoryAnimation() {
    if (historyAnimationStarted) return;

    historyAnimationStarted = true;

    // 각 바의 너비 비율 정의 (31%, 19%, 26%, 24%)
    const barWidths = ["31%", "19%", "26%", "24%"];
    let currentBar = 0;

    function animateNextBar() {
      if (currentBar < bars.length) {
        // 바 확장 애니메이션
        bars[currentBar].style.width = barWidths[currentBar];

        // 해당 글씨와 날짜 나타나는 애니메이션
        const historyItem = document.querySelector(
          `.history-item-${currentBar + 1}`
        );
        const dateItem = document.querySelector(`.date-${currentBar + 1}`);

        if (historyItem) {
          setTimeout(() => {
            historyItem.classList.add("show");
          }, 200); // 바 확장 후 0.2초 뒤에 글씨 나타남
        }

        if (dateItem) {
          setTimeout(() => {
            dateItem.classList.add("show");
          }, 400); // 바 확장 후 0.4초 뒤에 날짜 나타남
        }

        currentBar++;

        // 다음 바는 현재 바가 완료된 후 시작
        setTimeout(animateNextBar, 800); // 바 간격을 0.8초로 늘림
      }
    }

    // 첫 번째 바부터 시작
    setTimeout(animateNextBar, 300);
  }

  // 로딩 완료 직후 자동으로 HISTORY 애니메이션 시작
  function checkAndStartAnimation() {
    const preloader = document.querySelector(".preloader");
    if (
      preloader &&
      preloader.style.display === "none" &&
      !historyAnimationStarted
    ) {
      startHistoryAnimation();
    } else if (!historyAnimationStarted) {
      // 아직 로딩 중이면 100ms 후 다시 확인
      setTimeout(checkAndStartAnimation, 100);
    }
  }

  // 페이지 로드 후 로딩 상태 확인 시작
  setTimeout(checkAndStartAnimation, 100);

  // 백업 방법: 3초 후에도 로딩이 완료되지 않았다면 강제 시작
  setTimeout(() => {
    if (!historyAnimationStarted) {
      startHistoryAnimation();
    }
  }, 3000);

  //preloader
  // 격자 라인 생성 (첫 페이지 로드 시)
  createGridLines();

  // Elements
  const preloader = document.querySelector(".preloader");
  const counter = document.querySelector(".counter");
  const progressBar = document.querySelector(".progress-bar-fill");
  const title = document.querySelector(".title");
  const horizontalGridLines = document.querySelectorAll(
    ".horizontal-grid-line"
  );
  const verticalGridLines = document.querySelectorAll(".vertical-grid-line");

  // 프리로더를 표시 상태로 변경 (초기 로딩 시작)
  if (preloader) {
    preloader.style.display = "flex";
    preloader.style.opacity = "1";
    preloader.style.zIndex = "1000";

    // 카운터와 타이틀 초기화
    if (counter) counter.style.opacity = "0";
    if (title) title.style.opacity = "0";
    if (progressBar) progressBar.style.width = "0";
  }

  // Initialize GSAP timeline
  const tl = gsap.timeline();

  // Show counter and title
  tl.to([counter, title], {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out",
    stagger: 0.1,
  })

    // Animate horizontal grid lines
    .to(horizontalGridLines, {
      scaleX: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: "power1.inOut",
    })

    // Animate vertical grid lines
    .to(
      verticalGridLines,
      {
        scaleY: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power1.inOut",
      },
      "-=0.6"
    )

    // Animate loading progress
    .to(
      progressBar,
      {
        width: "100%",
        duration: 2,
        ease: "power1.inOut",
        onUpdate: function () {
          // Update counter based on progress
          const progress = Math.round(this.progress() * 100);
          counter.textContent = progress;
        },
      },
      "-=1.5"
    )

    // Transition to main content - 깔끔하게 사라지도록 수정
    .to(preloader, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      delay: 0.2,
    })
    .set(preloader, {
      display: "none",
    });

  // 네비게이션 클릭 시 이동
  const navItems = document.querySelectorAll(".side-nav ul li[data-page]");
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  navItems.forEach((li) => {
    li.addEventListener("click", (e) => {
      // 이벤트 버블링 방지
      e.stopPropagation();

      const pageIndex = parseInt(li.getAttribute("data-page"));

      // 로딩 시작 (네비게이션 클릭은 항상 아래로 이동)
      showLoadingAndNavigate(pageIndex);
    });
  });

  // PROJECT(nav-item project-nav) 클릭 시 MY WORK로 이동
  const projectNav = document.querySelector(".project-nav");
  if (projectNav) {
    projectNav.addEventListener("click", (e) => {
      // PROJECT 하위 항목이 클릭된 경우 이벤트 무시
      if (e.target.closest(".PROJECT_li")) {
        return;
      }

      // 로딩 시작
      showLoadingAndNavigate(2);
    });
  }

  // 깔끔한 풀페이지 스크롤 시스템
  let isScrolling = false;

  // 페이지 위치 계산 함수 (수정됨)
  function getPagePositions() {
    const pageHeights = Array.from(pages).map((p) => p.offsetHeight);

    const positions = [0];
    for (let i = 1; i < pageHeights.length; i++) {
      positions.push(positions[i - 1] + pageHeights[i - 1]);
    }

    return positions;
  }

  // 현재 페이지 계산 함수 (MY WORK 디버깅만 유지)
  function getCurrentPage() {
    const pageTops = getPagePositions();
    const scrollTop = container.scrollTop;

    // 각 페이지의 범위를 정확히 계산
    for (let i = 0; i < pageTops.length; i++) {
      const pageStart = pageTops[i];
      const pageEnd =
        i < pageTops.length - 1 ? pageTops[i + 1] : pageStart + 1000; // 마지막 페이지는 1000px 추가

      // 스크롤 위치가 현재 페이지 범위 내에 있는지 확인
      if (scrollTop >= pageStart && scrollTop < pageEnd) {
        return i;
      }

      // 페이지 경계에서의 처리
      if (i === pageTops.length - 1 && scrollTop >= pageStart) {
        return i;
      }
    }

    // 범위를 벗어난 경우 가장 가까운 페이지 찾기
    let closestPage = 0;
    let minDistance = Infinity;

    for (let i = 0; i < pageTops.length; i++) {
      const distance = Math.abs(scrollTop - pageTops[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPage = i;
      }
    }

    return closestPage;
  }

  // 페이지 이동 함수
  function moveToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= pages.length) return;

    const pageTops = getPagePositions();
    container.scrollTo({
      top: pageTops[pageIndex],
      behavior: "smooth",
    });
  }

  // 스크롤 이벤트 (매우 간단하게)
  container.addEventListener("wheel", (e) => {
    if (isScrolling || isLoading) return;

    e.preventDefault();
    isScrolling = true;
    closeModal();

    const currentPage = getCurrentPage();

    if (e.deltaY > 0 && currentPage < pages.length - 1) {
      // 아래로 스크롤
      moveToPage(currentPage + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      // 위로 스크롤
      moveToPage(currentPage - 1);
    }

    // 스크롤 완료 후 상태 해제
    setTimeout(() => {
      isScrolling = false;
    }, 800);
  });

  // 스크롤 완료 감지 및 네비게이션 업데이트
  container.addEventListener("scrollend", () => {
    if (!isLoading) {
      const currentPage = getCurrentPage();
      updateActiveNav(currentPage);
    }
  });

  // 스크롤 상태 정리 함수
  function resetScrollState() {
    isScrolling = false;
  }

  // 페이지가 처음 마운트될 때 HEADER를 활성화
  setTimeout(() => {
    updateActiveNav(0);
  }, 100);

  // 프로필 이미지 BOOK COVER 스타일 흔들림 애니메이션
  const profileImg = document.querySelector(".profile-img");
  if (profileImg) {
    profileImg.addEventListener("mouseenter", () => {
      gsap.to(profileImg, {
        scale: 1.05,
        y: -5,
        duration: 0.3,
        ease: "power2.out",
      });

      // 흔들림 효과 시작
      gsap.to(profileImg, {
        rotation: -1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(profileImg, {
            rotation: 1,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(profileImg, {
                rotation: 0,
                duration: 0.3,
                ease: "power2.out",
              });
            },
          });
        },
      });
    });

    profileImg.addEventListener("mouseleave", () => {
      gsap.to(profileImg, {
        scale: 1,
        y: 0,
        rotation: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    });
  }
});

// 모달 기능 (프로젝트별 내용 분기) - Character 모달과 동일한 스타일
function openModal(type, slideNumber) {
  const modal = document.getElementById("projectModal");
  const title = document.getElementById("modalTitle");
  const content = document.getElementById("modalContent");

  // 페이지별 표시/숨김 처리
  const page1 = document.getElementById("projectPage1");
  const page2 = document.getElementById("projectPage2");

  if (type === "mywork") {
    // My Work: 1페이지만 표시 (화살표 숨김)
    if (page1 && page2) {
      page1.style.display = "block";
      page2.style.display = "none";
    }

    // My Work에서는 화살표 숨김
    const arrows = modal.querySelectorAll(
      ".character-next-arrow, .character-prev-arrow"
    );
    arrows.forEach((arrow) => (arrow.style.display = "none"));

    // My Work 프로젝트별 실제 제목 설정
    let projectTitle = "";
    switch (slideNumber) {
      case 1:
        projectTitle = "We design places";
        break;
      case 2:
        projectTitle = "Netflix clone coding";
        break;
      case 3:
        projectTitle = "Fullpage Customizing";
        break;
      case 4:
        projectTitle = "Cyworld hamseter";
        break;
      case 5:
        projectTitle = "Onebite sky";
        break;
      default:
        projectTitle = `My Work ${slideNumber}`;
    }

    title.innerHTML = projectTitle;
    content.textContent = "--의 내용입니다";
  } else if (type === "teamwork") {
    // Team Work: 기본 모달 표시
    modal.style.display = "block";
    document.body.style.overflow = "hidden";

    // 프로젝트별로 올바른 1페이지 표시
    currentProjectNumber = slideNumber;

    // 모든 teamwork 모달 페이지 숨기기
    const allTeamworkPages = modal.querySelectorAll(".character-page");
    allTeamworkPages.forEach((page) => (page.style.display = "none"));

    // 현재 프로젝트의 1페이지만 표시
    let currentPage1Id = "";
    switch (slideNumber) {
      case 1:
        currentPage1Id = "rookiePage1";
        break;
      case 2:
        currentPage1Id = "metaphorPage1";
        break;
      case 3:
        currentPage1Id = "nongdamPage1";
        break;
      case 4:
        currentPage1Id = "lastTeamworkPage1";
        break;
      default:
        currentPage1Id = "rookiePage1";
    }

    const currentPage1 = document.getElementById(currentPage1Id);
    if (currentPage1) {
      currentPage1.style.display = "block";
    }

    // Team Work에서는 화살표 표시
    const arrows = modal.querySelectorAll(
      ".character-next-arrow, .character-prev-arrow"
    );
    arrows.forEach((arrow) => (arrow.style.display = "flex"));

    // Team Work 프로젝트별 실제 제목 설정
    let projectTitle = "";
    switch (slideNumber) {
      case 1:
        projectTitle = "ROOKie";
        break;
      case 2:
        projectTitle = "Metaphor";
        break;
      case 3:
        projectTitle = "NONGDAM";
        break;
      case 4:
        projectTitle = "PETOPIA";
        break;
      default:
        projectTitle = `Team Work ${slideNumber}`;
    }

    title.innerHTML = `${projectTitle}<span>[팀 프로젝트]</span>`;
  } else if (type === "designwork") {
    const category = slideNumber; // slideNumber가 실제로는 category임
    const projectNum = arguments[2] || 1; // 세 번째 인자가 프로젝트 번호

    if (category === "character") {
      // 프로젝트 번호에 따라 다른 모달 열기
      if (projectNum === 1) {
        // 첫 번째 캐릭터: 기롱이 모달
        openCharacterModal();
      } else if (projectNum === 2) {
        // 두 번째 캐릭터: 호랑이 모달
        openTigerModal();
      }
      return; // 기존 모달 열기 방지
    }

    let categoryName = "";
    switch (category) {
      case "bookcover":
        categoryName = "책표지";
        break;
      case "brochure":
        categoryName = "브로슈어";
        break;
      case "etc":
        categoryName = "기타";
        break;
      default:
        categoryName = "디자인";
    }

    title.innerHTML = `${categoryName} 프로젝트 ${slideNumber} 상세<span>[디자인 프로젝트]</span>`;
    content.textContent = "--의 내용입니다";
  }

  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("projectModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";

  // 모달 닫을 때 1페이지로 초기화
  const page1 = document.getElementById("projectPage1");
  const page2 = document.getElementById("projectPage2");
  const metaphorPage2 = document.getElementById("metaphorPage2");

  if (page1) {
    page1.style.display = "block";

    // 모든 2페이지 숨기기
    if (page2) page2.style.display = "none";
    if (metaphorPage2) metaphorPage2.style.display = "none";
  }
}

// 현재 활성화된 프로젝트 번호를 추적하는 변수
let currentProjectNumber = 1;

// 프로젝트 모달 페이지 이동 함수들
function nextProjectPage() {
  // 현재 프로젝트에 따라 다른 2페이지 보여주기
  if (currentProjectNumber === 1) {
    // ROOKie 프로젝트
    showProjectPage("rookiePage1", "rookiePage2");
  } else if (currentProjectNumber === 2) {
    // Metaphor 프로젝트
    showProjectPage("metaphorPage1", "metaphorPage2");
  } else if (currentProjectNumber === 3) {
    // NONGDAM 프로젝트
    showProjectPage("nongdamPage1", "nongdamPage2");
  } else if (currentProjectNumber === 4) {
    // 마지막 팀워크 프로젝트
    showProjectPage("lastTeamworkPage1", "lastTeamworkPage2");
  }
}

function prevProjectPage() {
  // 현재 프로젝트에 따라 1페이지로 돌아가기
  if (currentProjectNumber === 1) {
    showProjectPage("rookiePage2", "rookiePage1");
  } else if (currentProjectNumber === 2) {
    showProjectPage("metaphorPage2", "metaphorPage1");
  } else if (currentProjectNumber === 3) {
    showProjectPage("nongdamPage2", "nongdamPage1");
  } else if (currentProjectNumber === 4) {
    showProjectPage("lastTeamworkPage2", "lastTeamworkPage1");
  }
}

// 프로젝트 페이지 전환 헬퍼 함수
function showProjectPage(hidePageId, showPageId) {
  const hidePage = document.getElementById(hidePageId);
  const showPage = document.getElementById(showPageId);

  if (hidePage && showPage) {
    hidePage.style.display = "none";
    showPage.style.display = "block";
  }
}

function closeBookModal() {
  const modal = document.getElementById("bookModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Character 모달 관련 함수들
function openCharacterModal() {
  const modal = document.getElementById("characterModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeCharacterModal() {
  const modal = document.getElementById("characterModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function nextCharacterPage() {
  const characterModal = document.getElementById("characterModal");
  const currentPage = characterModal.querySelector(
    '.character-page:not([style*="display: none"])'
  );
  const nextPage = currentPage.nextElementSibling;

  if (nextPage && nextPage.classList.contains("character-page")) {
    currentPage.style.display = "none";
    nextPage.style.display = "block";
  }
}

function prevCharacterPage() {
  const characterModal = document.getElementById("characterModal");
  const currentPage = characterModal.querySelector(
    '.character-page:not([style*="display: none"])'
  );
  const prevPage = currentPage.previousElementSibling;

  if (prevPage && prevPage.classList.contains("character-page")) {
    currentPage.style.display = "none";
    prevPage.style.display = "block";
  }
}

// Tiger 모달 관련 함수들
function openTigerModal() {
  const modal = document.getElementById("tigerModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeTigerModal() {
  const modal = document.getElementById("tigerModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("projectModal");
  const characterModal = document.getElementById("characterModal");
  const tigerModal = document.getElementById("tigerModal");

  if (
    event.target === modal ||
    event.target.classList.contains("character-modal-overlay")
  ) {
    closeModal();
  }

  if (event.target === characterModal) {
    closeCharacterModal();
  }

  if (event.target === tigerModal) {
    closeTigerModal();
  }
};

function copyEmail() {
  navigator.clipboard.writeText("janggydk@daum.net");
  alert("이메일이 복사되었습니다!");
}

function goToTop() {
  document.querySelector(".fullpage-container").scrollTop = 0;
}

// Skip 버튼 전역 함수들
function skipMyWork() {
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  // Team Work 페이지로 이동 (페이지 인덱스 3)
  container.scrollTo({
    top: pages[3].offsetTop,
    behavior: "smooth",
  });

  // 네비게이션 활성화
  setTimeout(() => {
    updateActiveNav(3);
  }, 100);
}

function skipTeamWork() {
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  // Design Work 페이지로 이동 (페이지 인덱스 4)
  container.scrollTo({
    top: pages[4].offsetTop,
    behavior: "smooth",
  });

  // 네비게이션 활성화
  setTimeout(() => {
    updateActiveNav(4);
  }, 100);
}

function skipDesignWork() {
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  // Contact Me 페이지로 이동 (페이지 인덱스 5)
  container.scrollTo({
    top: pages[5].offsetTop,
    behavior: "smooth",
  });

  // 네비게이션 활성화
  setTimeout(() => {
    updateActiveNav(5);
  }, 100);
}

// 중복된 함수 제거 - 이미 위에서 정의됨

// 슬라이드쇼 기능 복구
function initSlideshow() {
  const myworkSlides = document.querySelectorAll(".mywork-page .slide");
  const teamworkSlides = document.querySelectorAll(".teamwork-page .slide");
  const myworkCounterStrip = document.querySelector(
    ".mywork-page .counter-strip"
  );
  const teamworkCounterStrip = document.querySelector(
    ".teamwork-page .counter-strip"
  );

  let myworkCurrentSlide = 0;
  let teamworkCurrentSlide = 0;
  let isAnimating = false;

  // 슬라이드 초기화
  function initSlides() {
    // My Work 슬라이드 초기화
    myworkSlides.forEach((slide, index) => {
      const textLines = slide.querySelectorAll(".slide__text-line");
      const img = slide.querySelector(".slide__img");
      const subtitle = slide.querySelector(".slide__subtitle");

      // 텍스트 라인 애니메이션 초기화
      textLines.forEach((line, lineIndex) => {
        gsap.set(line, {
          y: "100%",
          opacity: 0,
        });
      });

      // 서브타이틀 초기화
      if (subtitle) {
        gsap.set(subtitle, {
          opacity: 0,
        });
      }

      // 이미지 초기화
      gsap.set(img, {
        scale: 1.2,
      });

      // 첫 번째 슬라이드 활성화
      if (index === 0) {
        slide.classList.add("active");
        animateSlideIn(slide);
        // 초기 배경도 세팅
        const sectionBg = document.querySelector(".mywork-page .section-bg");
        const slideImgEl = slide.querySelector(".slide__img img");
        if (sectionBg && slideImgEl) {
          sectionBg.style.backgroundImage = `url(${slideImgEl.getAttribute(
            "src"
          )})`;
          sectionBg.style.opacity = "0.1";
        }
      }
    });

    // Team Work 슬라이드 초기화
    teamworkSlides.forEach((slide, index) => {
      const textLines = slide.querySelectorAll(".slide__text-line");
      const img = slide.querySelector(".slide__img");
      const subtitle = slide.querySelector(".slide__subtitle");

      // 텍스트 라인 애니메이션 초기화
      textLines.forEach((line, lineIndex) => {
        gsap.set(line, {
          y: "100%",
          opacity: 0,
        });
      });

      // 서브타이틀 초기화
      if (subtitle) {
        gsap.set(subtitle, {
          opacity: 0,
        });
      }

      // 이미지 초기화
      gsap.set(img, {
        scale: 1.2,
      });

      // 첫 번째 슬라이드 활성화
      if (index === 0) {
        slide.classList.add("active");
        animateSlideIn(slide);
        // 초기 배경도 세팅
        const sectionBg = document.querySelector(".teamwork-page .section-bg");
        const slideImgEl = slide.querySelector(".slide__img img");
        if (sectionBg && slideImgEl) {
          sectionBg.style.backgroundImage = `url(${slideImgEl.getAttribute(
            "src"
          )})`;
          sectionBg.style.opacity = "0.1";
        }
      }
    });
  }

  // 슬라이드 인 애니메이션
  function animateSlideIn(slide) {
    const textLines = slide.querySelectorAll(".slide__text-line");
    const img = slide.querySelector(".slide__img");
    const subtitle = slide.querySelector(".slide__subtitle");
    const parentSection = slide.closest(".page");
    const sectionBg = parentSection
      ? parentSection.querySelector(".section-bg")
      : null;
    const slideImgEl = slide.querySelector(".slide__img img");

    // 이미지 애니메이션
    gsap.to(img, {
      scale: 1,
      duration: 1.5,
      ease: "power2.out",
    });

    // 섹션 배경 동기화 (현재 슬라이드 이미지로 채우기)
    if (sectionBg) {
      let bgUrl = "";
      if (slideImgEl && slideImgEl.getAttribute("src")) {
        bgUrl = `url(${slideImgEl.getAttribute("src")})`;
      } else if (img && img.style && img.style.backgroundImage) {
        bgUrl = img.style.backgroundImage;
      }
      if (bgUrl) {
        sectionBg.style.backgroundImage = bgUrl;
        sectionBg.style.opacity = "0.1";
      }
    }

    // 텍스트 라인 애니메이션
    textLines.forEach((line, index) => {
      gsap.to(line, {
        y: "0%",
        opacity: 1,
        duration: 1,
        delay: 0.5 + index * 0.2,
        ease: "power2.out",
      });
    });

    // 서브타이틀 애니메이션
    if (subtitle) {
      gsap.to(subtitle, {
        opacity: 1,
        duration: 1,
        delay: 1.2,
        ease: "power2.out",
      });
    }
  }

  // 슬라이드 아웃 애니메이션
  function animateSlideOut(slide) {
    const textLines = slide.querySelectorAll(".slide__text-line");
    const img = slide.querySelector(".slide__img");
    const subtitle = slide.querySelector(".slide__subtitle");

    // 이미지 애니메이션
    gsap.to(img, {
      scale: 1.2,
      duration: 1.5,
      ease: "power2.in",
    });

    // 텍스트 라인 애니메이션
    textLines.forEach((line, index) => {
      gsap.to(line, {
        y: "-100%",
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: "power2.in",
      });
    });

    // 서브타이틀 애니메이션
    if (subtitle) {
      gsap.to(subtitle, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      });
    }
  }

  // My Work 다음 슬라이드로 이동
  function nextMyWorkSlide() {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlideEl = myworkSlides[myworkCurrentSlide];
    myworkCurrentSlide = (myworkCurrentSlide + 1) % myworkSlides.length;
    const nextSlideEl = myworkSlides[myworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      nextSlideEl.classList.add("active");
      animateSlideIn(nextSlideEl);

      // 카운터 업데이트
      updateMyWorkCounter();

      setTimeout(() => {
        isAnimating = false;
      }, 1000);
    }, 800);
  }

  // My Work 이전 슬라이드로 이동
  function prevMyWorkSlide() {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlideEl = myworkSlides[myworkCurrentSlide];
    myworkCurrentSlide =
      (myworkCurrentSlide - 1 + myworkSlides.length) % myworkSlides.length;
    const prevSlideEl = myworkSlides[myworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      prevSlideEl.classList.add("active");
      animateSlideIn(prevSlideEl);

      // 카운터 업데이트
      updateMyWorkCounter();

      setTimeout(() => {
        isAnimating = false;
      }, 1000);
    }, 800);
  }

  // Team Work 다음 슬라이드로 이동
  function nextTeamWorkSlide() {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlideEl = teamworkSlides[teamworkCurrentSlide];
    teamworkCurrentSlide = (teamworkCurrentSlide + 1) % teamworkSlides.length;
    const nextSlideEl = teamworkSlides[teamworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      nextSlideEl.classList.add("active");
      animateSlideIn(nextSlideEl);

      // 카운터 업데이트
      updateTeamWorkCounter();

      setTimeout(() => {
        isAnimating = false;
      }, 1000);
    }, 800);
  }

  // Team Work 이전 슬라이드로 이동
  function prevTeamWorkSlide() {
    if (isAnimating) return;
    isAnimating = true;

    const currentSlideEl = teamworkSlides[teamworkCurrentSlide];
    teamworkCurrentSlide =
      (teamworkCurrentSlide - 1 + teamworkSlides.length) %
      teamworkSlides.length;
    const prevSlideEl = teamworkSlides[teamworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      prevSlideEl.classList.add("active");
      animateSlideIn(prevSlideEl);

      // 카운터 업데이트
      updateTeamWorkCounter();

      setTimeout(() => {
        isAnimating = false;
      }, 1000);
    }, 800);
  }

  // My Work 카운터 업데이트
  function updateMyWorkCounter() {
    const currentSlideElement = document.querySelector(
      ".mywork-page .current-slide"
    );
    if (currentSlideElement) {
      const slideNumber = (myworkCurrentSlide + 1).toString().padStart(2, "0");
      currentSlideElement.textContent = slideNumber;
    }
  }

  // Team Work 카운터 업데이트
  function updateTeamWorkCounter() {
    const currentSlideElement = document.querySelector(
      ".teamwork-page .current-slide"
    );
    if (currentSlideElement) {
      const slideNumber = (teamworkCurrentSlide + 1)
        .toString()
        .padStart(2, "0");
      currentSlideElement.textContent = slideNumber;
    }
  }

  // 스크롤 이벤트 - 개선된 버전
  let slideScrollTimeout;
  let slideScrollThreshold = 60; // 슬라이드 스크롤 임계값 (px)
  let lastSlideScrollTime = 0;
  let slideScrollDebounceDelay = 200; // 슬라이드 스크롤 디바운싱 (ms)

  const myworkPage = document.querySelector(".mywork-page");
  const teamworkPage = document.querySelector(".teamwork-page");
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");

  if (myworkPage) {
    myworkPage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentTime = Date.now();

        // 슬라이드 스크롤 디바운싱
        if (currentTime - lastSlideScrollTime < slideScrollDebounceDelay) {
          return;
        }

        // 슬라이드 스크롤 임계값 체크
        if (Math.abs(e.deltaY) < slideScrollThreshold) {
          return;
        }

        lastSlideScrollTime = currentTime;

        clearTimeout(slideScrollTimeout);
        slideScrollTimeout = setTimeout(() => {
          if (e.deltaY > 0) {
            // 다음 슬라이드로 이동
            if (myworkCurrentSlide < myworkSlides.length - 1) {
              nextMyWorkSlide();
            } else {
              // 마지막 슬라이드에서 다음 섹션으로 이동
              container.scrollTo({
                top: pages[3].offsetTop, // Team Work 섹션
                behavior: "smooth",
              });
            }
          } else {
            // 이전 슬라이드로 이동
            if (myworkCurrentSlide > 0) {
              prevMyWorkSlide();
            } else {
              // 첫 번째 슬라이드에서 이전 섹션으로 이동
              container.scrollTo({
                top: pages[1].offsetTop, // Skills 섹션
                behavior: "smooth",
              });
            }
          }
        }, 120); // 슬라이드 전환 딜레이 최적화
      },
      { passive: false }
    );
  }

  if (teamworkPage) {
    teamworkPage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentTime = Date.now();

        // 슬라이드 스크롤 디바운싱
        if (currentTime - lastSlideScrollTime < slideScrollDebounceDelay) {
          return;
        }

        // 슬라이드 스크롤 임계값 체크
        if (Math.abs(e.deltaY) < slideScrollThreshold) {
          return;
        }

        lastSlideScrollTime = currentTime;

        clearTimeout(slideScrollTimeout);
        slideScrollTimeout = setTimeout(() => {
          if (e.deltaY > 0) {
            // 다음 슬라이드로 이동
            if (teamworkCurrentSlide < teamworkSlides.length - 1) {
              nextTeamWorkSlide();
            } else {
              // 마지막 슬라이드에서 다음 섹션으로 이동
              container.scrollTo({
                top: pages[4].offsetTop, // Design Work 섹션
                behavior: "smooth",
              });
            }
          } else {
            // 이전 슬라이드로 이동
            if (teamworkCurrentSlide > 0) {
              prevTeamWorkSlide();
            } else {
              // 첫 번째 슬라이드에서 이전 섹션으로 이동
              container.scrollTo({
                top: pages[2].offsetTop, // My Work 섹션
                behavior: "smooth",
              });
            }
          }
        }, 120); // 슬라이드 전환 딜레이 최적화
      },
      { passive: false }
    );
  }

  // 커스텀 커서 기능
  function initCustomCursor() {
    const myworkCursor = document.querySelector(".mywork-page .custom-cursor");
    const teamworkCursor = document.querySelector(
      ".teamwork-page .custom-cursor"
    );

    function setupCursor(cursor, pageElement, nextSlideFunc, prevSlideFunc) {
      if (!cursor || !pageElement) return;

      let isOverProjectBox = false;
      let isOverSkipButton = false;

      // 마우스 이동 이벤트
      pageElement.addEventListener("mousemove", (e) => {
        // 커서는 .project-content (position: relative) 기준으로 배치됨
        const positionContext = cursor.parentElement || pageElement;
        const rect = positionContext.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 프로젝트 박스 영역 확인
        const projectBox = pageElement.querySelector(".project-box");
        const boxRect = projectBox.getBoundingClientRect();
        const boxX = e.clientX - boxRect.left;
        const boxY = e.clientY - boxRect.top;

        // Skip 버튼 영역 확인
        const skipButton = pageElement.querySelector(".skip-button");
        const skipRect = skipButton.getBoundingClientRect();
        const skipX = e.clientX - skipRect.left;
        const skipY = e.clientY - skipRect.top;

        isOverProjectBox =
          boxX >= 0 &&
          boxX <= boxRect.width &&
          boxY >= 0 &&
          boxY <= boxRect.height;

        isOverSkipButton =
          skipX >= 0 &&
          skipX <= skipRect.width &&
          skipY >= 0 &&
          skipY <= skipRect.height;

        // 커서 위치 업데이트 (부모 기준 보정)
        cursor.style.left = x + "px";
        cursor.style.top = y + "px";

        // 화면 영역에 따른 커서 상태 변경
        const pageWidth = pageElement.getBoundingClientRect().width;
        const leftArea = pageWidth * 0.3; // 왼쪽 30% 영역
        const rightArea = pageWidth * 0.7; // 오른쪽 70% 영역

        if (!isOverProjectBox && !isOverSkipButton) {
          if (x < leftArea) {
            // 왼쪽 영역 - 이전 화살표
            cursor.classList.remove("next");
            cursor.classList.add("prev", "active");
            document.body.classList.add("custom-cursor-active");
          } else if (x > rightArea) {
            // 오른쪽 영역 - 다음 화살표
            cursor.classList.remove("prev");
            cursor.classList.add("next", "active");
            document.body.classList.add("custom-cursor-active");
          } else {
            // 중앙 영역 - 커서 숨김
            cursor.classList.remove("prev", "next", "active");
            document.body.classList.remove("custom-cursor-active");
          }
        } else {
          // 프로젝트 박스나 skip 버튼 위에서는 커서 숨김
          cursor.classList.remove("prev", "next", "active");
          document.body.classList.remove("custom-cursor-active");
        }
      });

      // 마우스 클릭 이벤트
      pageElement.addEventListener("click", (e) => {
        const rect = pageElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pageWidth = rect.width;
        const leftArea = pageWidth * 0.3;
        const rightArea = pageWidth * 0.7;

        if (!isOverProjectBox && !isOverSkipButton) {
          if (x < leftArea) {
            // 왼쪽 클릭 - 이전 슬라이드 또는 이전 섹션
            if (pageElement.classList.contains("mywork-page")) {
              if (myworkCurrentSlide === 0) {
                // 첫 번째 슬라이드에서 이전 섹션으로 이동
                container.scrollTo({
                  top: pages[1].offsetTop, // Skills 섹션
                  behavior: "smooth",
                });
              } else {
                prevSlideFunc();
              }
            } else if (pageElement.classList.contains("teamwork-page")) {
              if (teamworkCurrentSlide === 0) {
                // 첫 번째 슬라이드에서 이전 섹션으로 이동
                container.scrollTo({
                  top: pages[2].offsetTop, // My Work 섹션
                  behavior: "smooth",
                });
              } else {
                prevSlideFunc();
              }
            }
          } else if (x > rightArea) {
            // 오른쪽 클릭 - 다음 슬라이드 또는 다음 섹션
            if (pageElement.classList.contains("mywork-page")) {
              if (myworkCurrentSlide === myworkSlides.length - 1) {
                // 마지막 슬라이드에서 다음 섹션으로 이동
                container.scrollTo({
                  top: pages[3].offsetTop, // Team Work 섹션
                  behavior: "smooth",
                });
              } else {
                nextSlideFunc();
              }
            } else if (pageElement.classList.contains("teamwork-page")) {
              if (teamworkCurrentSlide === teamworkSlides.length - 1) {
                // 마지막 슬라이드에서 다음 섹션으로 이동
                container.scrollTo({
                  top: pages[4].offsetTop, // Design Work 섹션
                  behavior: "smooth",
                });
              } else {
                nextSlideFunc();
              }
            }
          }
        }
      });

      // 마우스가 페이지를 벗어날 때 커서 숨김
      pageElement.addEventListener("mouseleave", () => {
        cursor.classList.remove("prev", "next", "active");
        document.body.classList.remove("custom-cursor-active");
      });
    }

    // My Work 커서 설정
    setupCursor(myworkCursor, myworkPage, nextMyWorkSlide, prevMyWorkSlide);

    // Team Work 커서 설정
    setupCursor(
      teamworkCursor,
      teamworkPage,
      nextTeamWorkSlide,
      prevTeamWorkSlide
    );
  }

  // 초기화
  initSlides();
  initCustomCursor();
  initDesignWorkButtons();
}

// Design Work 버튼 이벤트 초기화
function initDesignWorkButtons() {
  const moreButtons = document.querySelectorAll(
    ".design-project-box .more-btn"
  );

  moreButtons.forEach((button, index) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // 부모 클릭 이벤트 방지
      const projectNumber = index + 1;
      openModal("designwork", "character", projectNumber);
    });
  });
}

// 책표지 클릭 이벤트 초기화
function initBookCovers() {
  const bookItems = document.querySelectorAll(".book-item");

  bookItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const bookNumber = item.getAttribute("data-book");
      const bookImage = item.querySelector("img").src;
      openBookModal(bookImage, bookNumber);
    });
  });
}

// 브로슈어 클릭 이벤트 초기화
function initBrochures() {
  const brochureItems = document.querySelectorAll(".brochure-item");

  brochureItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const brochureNumber = item.getAttribute("data-brochure");
      const brochureImage = item.querySelector("img").src;
      openBookModal(brochureImage, brochureNumber); // 책표지와 동일한 모달 사용
    });
  });
}

// 기타 카테고리 클릭 이벤트 초기화
function initEtc() {
  const etcItems = document.querySelectorAll(".etc-item");

  etcItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const etcNumber = item.getAttribute("data-etc");
      const etcImage = item.querySelector("img").src;
      openBookModal(etcImage, etcNumber); // 책표지와 동일한 모달 사용
    });
  });
}

// 책표지 모달 열기
function openBookModal(imageSrc, bookNumber) {
  const modal = document.getElementById("bookModal");
  const modalImage = document.getElementById("bookModalImage");

  if (modal && modalImage) {
    modalImage.src = imageSrc;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// 책표지 모달 닫기
function closeBookModal() {
  const modal = document.getElementById("bookModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// SKILLS 페이지 말풍선 기능
function initSkillsTooltip() {
  const tooltipContainer = document.getElementById("tooltip");
  const skillItems = document.querySelectorAll(".skill-item");

  skillItems.forEach((item) => {
    item.addEventListener("mouseenter", (e) => {
      const description = item.getAttribute("data-description");
      if (description) {
        showTooltip(e, description);
      }
    });

    item.addEventListener("mouseleave", () => {
      hideTooltip();
    });
  });

  function showTooltip(e, text) {
    const rect = e.target.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = text;

    tooltipContainer.innerHTML = "";
    tooltipContainer.appendChild(tooltip);

    // 말풍선 위치 계산
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = rect.left + rect.width / 2;
    let y = rect.top - 10;
    let position = "tooltip-top";

    // 화면 밖으로 나가지 않도록 위치 조정
    if (y - tooltipRect.height < 0) {
      y = rect.bottom + 10;
      position = "tooltip-bottom";
    }

    if (x + tooltipRect.width / 2 > viewportWidth) {
      x = rect.left - tooltipRect.width / 2;
      position = "tooltip-left";
    } else if (x - tooltipRect.width / 2 < 0) {
      x = rect.right + tooltipRect.width / 2;
      position = "tooltip-right";
    }

    tooltip.className = `tooltip ${position}`;
    tooltipContainer.style.left = x + "px";
    tooltipContainer.style.top = y + "px";
    tooltipContainer.style.opacity = "1";
  }

  function hideTooltip() {
    tooltipContainer.style.opacity = "0";
  }
}

// 페이지 로드 후 슬라이드쇼 초기화
window.addEventListener("load", () => {
  initSlideshow();
  initDesignWorkCategories();
  initBookCovers();
  initBrochures();
  initEtc();
  initSkillsTooltip(); // 말풍선 기능 초기화 추가
});

// Design Work 페이지 카테고리 기능
function initDesignWorkCategories() {
  const categoryButtons = document.querySelectorAll(
    ".designwork-page .category-btn"
  );
  const designTitleSection = document.querySelector(
    ".designwork-page .design-title-section"
  );
  const designProjectBoxes = document.querySelectorAll(
    ".designwork-page .design-project-box"
  );
  const bookCoversGrid = document.getElementById("bookCoversGrid");
  const brochureGrid = document.getElementById("brochureGrid");
  const etcGrid = document.getElementById("etcGrid");

  // 카테고리별 그리드 설정
  const categoryGrids = {
    character: { show: designProjectBoxes, hide: [], display: "flex" },
    bookcover: {
      show: [bookCoversGrid],
      hide: [designProjectBoxes],
      display: "grid",
    },
    brochure: {
      show: [brochureGrid],
      hide: [designProjectBoxes],
      display: "grid",
    },
    etc: { show: [etcGrid], hide: [designProjectBoxes], display: "grid" },
  };

  // 그리드 업데이트 함수
  function updateGrids(category) {
    // 모든 그리드와 프로젝트 박스 숨기기
    [bookCoversGrid, brochureGrid, etcGrid, ...designProjectBoxes].forEach(
      (element) => {
        if (element) element.style.display = "none";
      }
    );

    // 선택된 카테고리에 따라 그리드 표시
    const { show, display } = categoryGrids[category];
    show.forEach((element) => {
      if (element) element.style.display = display;
    });
  }

  // 제목 애니메이션 함수
  function animateTitleChange(titles) {
    // 이전 애니메이션 타이머가 있으면 취소
    if (currentAnimationTimer) {
      clearTimeout(currentAnimationTimer);
      currentAnimationTimer = null;
    }

    // 애니메이션 상태 정리
    titles.forEach((title) => {
      title.classList.remove("animate-in", "animate-change");
    });

    // transition 일시 비활성화하여 즉시 초기 상태 적용
    titles.forEach((title) => {
      title.style.transition = "none";
    });

    // 강제 리플로우로 초기 상태 적용
    titles.forEach((title) => title.offsetHeight);

    // transition 복원
    titles.forEach((title) => {
      title.style.transition = "";
    });

    // 애니메이션 시작
    setTimeout(() => {
      titles.forEach((title) => title.classList.add("animate-in"));
    }, 100);

    // 애니메이션 상태 관리
    isDesignTitleAnimating = true;
    currentAnimationTimer = setTimeout(() => {
      isDesignTitleAnimating = false;
      currentAnimationTimer = null;
    }, 700);
  }

  // 카테고리 설정 객체
  const categoryConfig = {
    character: { main: "CHARACTER", sub: "DESIGN WORK" },
    bookcover: { main: "BOOK COVER", sub: "DESIGN WORK" },
    brochure: { main: "BROCHURE", sub: "DESIGN WORK" },
    etc: { main: "ETC", sub: "DESIGN WORK" },
  };

  // 카테고리 버튼 클릭 이벤트
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.getAttribute("data-category");

      // 모든 버튼에서 active 클래스 제거
      categoryButtons.forEach((b) => b.classList.remove("active"));

      // 클릭된 버튼에 active 클래스 추가
      btn.classList.add("active");

      // design-content-box에 카테고리별 클래스 추가/제거
      const designContentBox = document.querySelector(".design-content-box");
      if (designContentBox) {
        designContentBox.classList.remove(
          "character-category",
          "bookcover-category",
          "brochure-category",
          "etc-category"
        );
        designContentBox.classList.add(`${category}-category`);
      }

      // 배경 텍스트 변경
      const designBgTitle = document.getElementById("designBgTitle");
      if (designBgTitle) {
        const bgTextMap = {
          character: "Character",
          bookcover: "Book Cover",
          brochure: "Brochure",
          etc: "ETC",
        };
        designBgTitle.textContent = bgTextMap[category] || "Character";
      }

      // 제목 변경
      if (designTitleSection) {
        const mainTitle =
          designTitleSection.querySelector(".design-main-title");
        const subTitle = designTitleSection.querySelector(".design-sub-title");

        if (mainTitle && subTitle && categoryConfig[category]) {
          // 제목 텍스트 변경
          mainTitle.textContent = categoryConfig[category].main;
          subTitle.textContent = categoryConfig[category].sub;

          // 애니메이션 실행
          animateTitleChange([mainTitle, subTitle]);
        }
      }

      // 프로젝트 박스 onclick 이벤트 업데이트
      designProjectBoxes.forEach((box, index) => {
        box.onclick = () => openModal("designwork", category, index + 1);
      });

      // 그리드 업데이트
      updateGrids(category);
    });
  });
}