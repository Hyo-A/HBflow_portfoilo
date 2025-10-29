// Preloader 애니메이션 상수
const PRELOADER_CONFIG = {
  progressBarDuration: 1.2, // 프로그레스바 애니메이션 시간 (초)
  gridLineDuration: 0.8, // 격자 라인 애니메이션 시간 (초)
  gridLineStagger: 0.03, // 격자 라인 스태거 간격
  counterTitleStagger: 0.05, // 카운터/타이틀 스태거 간격
};

// 스크롤 애니메이션 설정
const SCROLL_CONFIG = {
  pageTransitionDuration: 2, // 페이지 이동 애니메이션 시간 (초) - 조절 가능
  pageTransitionEase: "power3.inOut", // 이징 함수 (power1, power2, power3, sine, expo 등)
};

// 전역 상태 관리 객체
const appState = {
  // 로딩 및 애니메이션 상태
  isLoading: false,
  isAnimating: false,
  isDesignTitleAnimating: false,
  currentAnimationTimer: null,
  pendingCategoryChange: null,

  // 스크롤 상태
  isScrolling: false,

  // 슬라이드쇼 상태
  myworkSlides: [],
  teamworkSlides: [],
  myworkCurrentSlide: 0,
  teamworkCurrentSlide: 0,

  // 프로젝트 상태
  currentProjectNumber: 1,
};

// 터치 스크롤 관련 변수
let touchStartY = 0;

// 스크롤 디바운스 타이머
let scrollTimer = null;

// DOM 요소 캐시 객체
const domElements = {
  // 기본 컨테이너들
  container: null,
  pages: null,
  preloader: null,

  // 로딩 관련 요소들
  counter: null,
  progressBar: null,
  title: null,
  gridLines: null,

  // 네비게이션 요소들
  allNavItems: null,
  projectNav: null,
  subNavItems: null,

  // 슬라이드 관련 요소들
  myworkPage: null,
  teamworkPage: null,

  // 기타 요소들
  rightGreenBar: null,
  designMainTitle: null,
  designSubTitle: null,

  // 초기화 플래그
  initialized: false,
};

// 상태 업데이트 헬퍼 함수들
function updateAppState(key, value) {
  appState[key] = value;
}

function getAppState(key) {
  return appState[key];
}

// 페이지 이동 함수 (터치 스크롤용) - 전역 함수
function moveToPage(pageIndex) {
  if (isMobile()) {
    return; // 모바일에서는 브라우저 기본 스크롤 사용
  }

  if (pageIndex < 0 || pageIndex >= domElements.pages.length) return;

  const pageTops = getPagePositions();
  domElements.container.scrollTo({
    top: pageTops[pageIndex],
    behavior: "smooth",
  });
}

// DOM 요소 초기화 함수
function initializeDOMElements() {
  if (domElements.initialized) return;

  // 기본 컨테이너들
  domElements.container = document.querySelector(".fullpage-container");
  domElements.pages = document.querySelectorAll(".page");
  domElements.preloader = document.querySelector(".preloader");

  // 로딩 관련 요소들
  domElements.counter = document.querySelector(".counter");
  domElements.progressBar = document.querySelector(".progress-bar-fill");
  domElements.title = document.querySelector(".title");
  domElements.gridLines = document.querySelector(".grid-lines");

  // 네비게이션 요소들
  domElements.allNavItems = document.querySelectorAll(".nav-item");
  domElements.projectNav = document.querySelector(".project-nav");
  domElements.subNavItems = document.querySelectorAll(".PROJECT_li .nav-item");

  // 슬라이드 관련 요소들
  domElements.myworkPage = document.querySelector(".mywork-page");
  domElements.teamworkPage = document.querySelector(".teamwork-page");

  // 기타 요소들
  domElements.rightGreenBar = document.querySelector(".right-green-bar");
  domElements.designMainTitle = document.querySelector(
    ".designwork-page .design-title-section .design-main-title"
  );
  domElements.designSubTitle = document.querySelector(
    ".designwork-page .design-title-section .design-sub-title"
  );

  domElements.initialized = true;
}

// 격자 라인 동적 생성 함수
function createGridLines() {
  // domElements가 초기화되지 않았을 수 있으므로 직접 DOM에서 찾기
  let gridContainer =
    domElements.gridLines || document.querySelector(".grid-lines");
  if (!gridContainer) return;

  // domElements에도 저장 (다음 호출을 위해)
  domElements.gridLines = gridContainer;

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const gridSpacing = screenWidth <= 480 ? 150 : screenWidth <= 768 ? 200 : 300;

  gridContainer.innerHTML = "";

  // 수평선 생성
  const horizontalCount = Math.ceil((screenHeight - 100) / gridSpacing) + 1;
  for (let i = 0; i < horizontalCount; i++) {
    const line = document.createElement("div");
    line.className = "horizontal-grid-line";
    line.style.top = `${100 + i * gridSpacing}px`;
    line.style.position = "absolute";
    line.style.width = "100%";
    line.style.height = "1px";
    line.style.backgroundColor = "var(--color-accent)";
    line.style.opacity = "0.2";
    line.style.transform = "scaleX(0)";
    line.style.transformOrigin = "left";
    gridContainer.appendChild(line);
  }

  // 수직선 생성
  const verticalCount = Math.ceil(screenWidth / gridSpacing) + 1;
  for (let i = 0; i < verticalCount; i++) {
    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.left = `${i * gridSpacing}px`;
    line.style.position = "absolute";
    line.style.width = "1px";
    line.style.height = "100%";
    line.style.backgroundColor = "var(--color-accent)";
    line.style.opacity = "0.2";
    line.style.transform = "scaleY(0)";
    line.style.transformOrigin = "top";
    gridContainer.appendChild(line);
  }
}

// 격자 라인 선택 및 초기화 함수
function initGridLines() {
  const horizontalGridLines = document.querySelectorAll(
    ".horizontal-grid-line"
  );
  const verticalGridLines = document.querySelectorAll(".vertical-grid-line");

  horizontalGridLines.forEach((line) => {
    line.style.transform = "scaleX(0)";
  });
  verticalGridLines.forEach((line) => {
    line.style.transform = "scaleY(0)";
  });

  return { horizontalGridLines, verticalGridLines };
}

// 로딩 표시 후 페이지 이동 함수 (전역 함수)
function showLoadingAndNavigate(pageIndex) {
  closeModal();
  updateAppState("isLoading", true); // 로딩 시작

  const container = domElements.container;
  const pages = domElements.pages;

  // 로딩 요소들
  const preloader = domElements.preloader;
  const counter = domElements.counter;
  const progressBar = domElements.progressBar;
  const title = domElements.title;
  createGridLines();
  const { horizontalGridLines, verticalGridLines } = initGridLines();

  preloader.style.display = "flex";
  preloader.style.opacity = "1";
  preloader.style.transform = "translateY(0)";
  preloader.style.zIndex = "1000";

  container.style.scrollBehavior = "auto";
  container.classList.add("loading");

  counter.textContent = "0";
  counter.style.opacity = "0";
  counter.style.transform = "translateY(20px)";
  title.style.opacity = "0";
  title.style.transform = "translateY(20px)";

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
      updateAppState("isLoading", false); // 로딩 완료

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
    stagger: PRELOADER_CONFIG.counterTitleStagger,
  })
    .to(
      horizontalGridLines,
      {
        scaleX: 1,
        duration: PRELOADER_CONFIG.gridLineDuration,
        stagger: PRELOADER_CONFIG.gridLineStagger,
        ease: "power1.inOut",
      },
      "-=0.2"
    )
    .to(
      verticalGridLines,
      {
        scaleY: 1,
        duration: PRELOADER_CONFIG.gridLineDuration,
        stagger: PRELOADER_CONFIG.gridLineStagger,
        ease: "power1.inOut",
      },
      "-=0.4"
    )
    .to(
      progressBar,
      {
        width: "100%",
        duration: PRELOADER_CONFIG.progressBarDuration,
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
  const allNavItems = domElements.allNavItems;

  allNavItems.forEach((item, index) => {
    item.classList.remove("active");
  });

  // 현재 페이지에 해당하는 네비게이션 아이템 활성화
  const currentNav = document.querySelector(`[data-page="${currentPage}"]`);

  if (currentNav) {
    currentNav.classList.add("active");

    // Project 하위 페이지인 경우 PROJECT도 활성화
    if (currentPage >= 2 && currentPage <= 4) {
      const projectNav = domElements.projectNav;
      if (projectNav) {
        projectNav.classList.add("active");

        // PROJECT 하위 항목들 중 현재 페이지에 해당하는 것 활성화
        const subNavItems = domElements.subNavItems;
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
    if (appState.isDesignTitleAnimating) return;

    const mainTitle = domElements.designMainTitle;
    const subTitle = domElements.designSubTitle;

    if (mainTitle && subTitle) {
      // 애니메이션 상태 설정
      appState.isDesignTitleAnimating = true;

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
          appState.isDesignTitleAnimating = false;
        }, 600); // transition 시간과 동일
      }, 700); // 스크롤 애니메이션 완료 시간과 동일
    }
  }
}

// 프로그레스바 업데이트 함수 (전역 함수)
function updateProgressBar(currentPage) {
  const progressBar = domElements.rightGreenBar;
  const pages = domElements.pages;
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
  // 모바일 환경에서 JavaScript 스크롤 제어 완전히 비활성화
  if (isMobile()) {
    const container = document.querySelector(".fullpage-container");
    if (container) {
      container.style.scrollBehavior = "auto";
    }
  }

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

  createGridLines();
  const preloader = document.querySelector(".preloader");
  const counter = document.querySelector(".counter");
  const progressBar = document.querySelector(".progress-bar-fill");
  const title = document.querySelector(".title");

  if (preloader) {
    preloader.style.display = "flex";
    preloader.style.opacity = "1";
    preloader.style.zIndex = "1000";
    if (counter) counter.style.opacity = "0";
    if (title) title.style.opacity = "0";
    if (progressBar) progressBar.style.width = "0";
  }

  const { horizontalGridLines, verticalGridLines } = initGridLines();

  // Initialize GSAP timeline
  const tl = gsap.timeline();

  // Show counter and title
  tl.to([counter, title], {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "power2.out",
    stagger: PRELOADER_CONFIG.counterTitleStagger,
  })
    .to(
      horizontalGridLines,
      {
        scaleX: 1,
        duration: PRELOADER_CONFIG.gridLineDuration,
        stagger: PRELOADER_CONFIG.gridLineStagger,
        ease: "power1.inOut",
      },
      "-=0.2"
    )
    .to(
      verticalGridLines,
      {
        scaleY: 1,
        duration: PRELOADER_CONFIG.gridLineDuration,
        stagger: PRELOADER_CONFIG.gridLineStagger,
        ease: "power1.inOut",
      },
      "-=0.4"
    )
    .to(
      progressBar,
      {
        width: "100%",
        duration: PRELOADER_CONFIG.progressBarDuration,
        ease: "power1.inOut",
        onUpdate: function () {
          const progress = Math.round(this.progress() * 100);
          counter.textContent = progress;
        },
      },
      "-=0.8"
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

  // 페이지 위치 계산 함수 (정확도 개선)
  function getPagePositions() {
    const pages = domElements.pages; // 이미 캐시되어 있음
    const positions = [];

    pages.forEach((page) => {
      // offsetTop은 문서 상단(또는 container 상단)으로부터의 정확한 위치
      positions.push(page.offsetTop);
    });

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

  // 페이지 이동 함수 (GSAP으로 시간 조절 가능한 스크롤 애니메이션)
  // 모바일에서는 브라우저 기본 스크롤을 사용하도록 함수 자체를 비활성화
  function moveToPage(pageIndex) {
    // 모바일에서는 강제 페이지 이동 비활성화
    if (isMobile()) {
      return; // 모바일에서는 브라우저 기본 스크롤 사용
    }

    if (pageIndex < 0 || pageIndex >= pages.length) return;

    const pageTops = getPagePositions();
    const targetScrollTop = pageTops[pageIndex];
    const startScrollTop = container.scrollTop;

    // GSAP으로 부드러운 스크롤 애니메이션 (시간 조절 가능)
    // scrollTop을 직접 애니메이션하기 위해 객체로 래핑
    const scrollObj = { scroll: startScrollTop };

    gsap.to(scrollObj, {
      scroll: targetScrollTop,
      duration: SCROLL_CONFIG.pageTransitionDuration, // 상수로 관리되는 이동 시간
      ease: SCROLL_CONFIG.pageTransitionEase, // 이징 함수
      onUpdate: () => {
        container.scrollTop = scrollObj.scroll;
      },
      onComplete: () => {
        // 애니메이션 완료 후 정확한 위치로 스냅 (CSS scroll-snap 보완)
        container.scrollTop = targetScrollTop;
      },
    });
  }

  // DOM 요소 초기화
  initializeDOMElements();

  // CSS scroll-snap 사용: wheel 이벤트 리스너 제거
  // 브라우저가 자동으로 스크롤을 처리하고 CSS scroll-snap이 페이지 스냅을 처리함
  // 터치 이벤트(touchstart/touchend)는 아래에서 별도로 처리됨

  // 스크롤 완료 감지 및 네비게이션 업데이트 (브라우저 호환성 개선)
  container.addEventListener("scroll", () => {
    // 이전 타이머가 있으면 취소
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    // 스크롤이 멈춘 후 150ms 뒤에 처리
    scrollTimer = setTimeout(() => {
      // 스크롤 완료 시 isScrolling 상태 해제
      if (appState.isScrolling) {
        appState.isScrolling = false;
      }

      // 네비게이션 업데이트
      if (!appState.isLoading) {
        const currentPage = getCurrentPage();
        updateActiveNav(currentPage);
      }
    }, 150);
  });

  // 모바일이 아닐 때만 풀페이지 스와이프 감지 로직을 등록합니다
  // 모바일에서는 브라우저의 기본 터치 스크롤을 사용하도록 합니다
  if (!isMobile()) {
    // 터치 스크롤 관련 변수 초기화는 유지
    // 모바일이 아니지만 터치 디바이스일 때 (예: 태블릿, 터치스크린 노트북)

    container.addEventListener(
      "touchstart",
      (e) => {
        // 풀페이지 스크롤 중이거나 로딩 중이면 동작 금지
        if (appState.isScrolling || appState.isLoading) return;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    container.addEventListener("touchend", (e) => {
      // 모바일이 아니지만 터치 디바이스일 때
      if (appState.isScrolling || appState.isLoading) return;

      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchEndY - touchStartY;

      // 충분한 스와이프 거리가 있어야 동작
      if (Math.abs(swipeDistance) < 50) return;

      appState.isScrolling = true;
      closeModal();
      const currentPage = getCurrentPage();

      if (swipeDistance < 0 && currentPage < pages.length - 1) {
        // 위로 스와이프 (페이지 다운)
        moveToPage(currentPage + 1);
      } else if (swipeDistance > 0 && currentPage > 0) {
        // 아래로 스와이프 (페이지 업)
        moveToPage(currentPage - 1);
      }
      // 스크롤 완료는 scroll 이벤트에서 감지됨
    });
  }

  // 스크롤 상태 정리 함수
  function resetScrollState() {
    appState.isScrolling = false;
    // 스크롤 타이머도 정리
    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  }

  // 페이지가 처음 마운트될 때 HEADER를 활성화
  setTimeout(() => {
    updateActiveNav(0);
  }, 100);

  // 햄버거 메뉴 초기화 (모바일 네비게이션바 작동을 위해)
  initHamburgerMenu();

  // 윈도우 리사이즈 이벤트 등록
  window.addEventListener("resize", handleWindowResize);

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

  // 페이지별 표시/숨김 처리
  const page1 = document.getElementById("projectPage1");
  const page2 = document.getElementById("projectPage2");

  if (type === "mywork") {
    // 먼저 모든 모달 닫기
    closeAllModals();

    // My Work 전용 모달 표시
    const myworkModal = document.getElementById("myworkModal");
    if (myworkModal) {
      myworkModal.classList.add("show");
      myworkModal.style.display = "block";
      myworkModal.style.visibility = "visible";
      myworkModal.style.opacity = "1";
      document.body.style.overflow = "hidden";

      // 모든 mywork 페이지 숨기기
      const allMyworkPages = myworkModal.querySelectorAll(".mywork-modal-page");
      allMyworkPages.forEach((page) => (page.style.display = "none"));

      // 현재 프로젝트 페이지 표시
      const currentPage = document.getElementById(`mywork${slideNumber}`);
      if (currentPage) {
        currentPage.style.display = "block";
      }
    }
  } else if (type === "teamwork") {
    // 먼저 모든 모달 닫기
    closeAllModals();

    // Team Work: 기본 모달 표시
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";

    // 프로젝트별로 올바른 1페이지 표시
    appState.currentProjectNumber = slideNumber;

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
      ".modal-next-arrow, .character-prev-arrow"
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

    // Teamwork 모달 표시
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";
  } else if (type === "designwork") {
    const category = slideNumber; // slideNumber가 실제로는 category임
    const projectNum = arguments[2] || 1; // 세 번째 인자가 프로젝트 번호

    console.log("Design work modal opening:", { category, projectNum });

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

    // 먼저 모든 모달 닫기
    closeAllModals();

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

    // designwork의 기본 모달 표시
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";
  }
}

// ===== HB 통합 모달 시스템 =====
function closeAllModals() {
  // 모든 모달 닫기
  const modals = [
    "projectModal", // teamwork
    "myworkModal", // mywork
    "characterModal", // character
    "tigerModal", // tiger
    "bookModal", // book
  ];

  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      // 모든 모달 상태 초기화
      modal.classList.remove("show");
      modal.style.display = "none";
      modal.style.visibility = "hidden";
      modal.style.opacity = "0";
    }
  });

  // body 스크롤 복원
  document.body.style.overflow = "auto";
}

// 레거시 호환성을 위한 기존 함수 유지
function closeModal() {
  closeAllModals();
}

// 개별 모달 닫기 함수들 제거 - closeAllModals()로 통합됨
function closeMyworkModal() {
  closeAllModals();
}

// 범용 모달 페이지 전환 함수
function navigateModal(modalId, direction) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with id "${modalId}" not found`);
    return;
  }

  // 현재 활성 페이지 찾기 (character-page 클래스 사용)
  const currentPage = modal.querySelector(
    '.character-page:not([style*="display: none"])'
  );
  if (!currentPage) {
    console.error(`No active page found in modal "${modalId}"`);
    return;
  }

  // 현재 페이지 인덱스 가져오기 (data-page-index가 없으면 ID 기반으로 계산)
  let currentIndex = parseInt(currentPage.getAttribute("data-page-index"));

  if (isNaN(currentIndex)) {
    // data-page-index가 없으면 ID에서 추출
    const pageId = currentPage.id;
    if (pageId.includes("Page")) {
      // characterPage1, characterPage2, characterPage3
      const match = pageId.match(/(\d+)$/);
      if (match) {
        currentIndex = parseInt(match[1]) - 1; // 0-based index
      }
    } else if (pageId.includes("mywork")) {
      // mywork1, mywork2, mywork3, mywork4, mywork5, mywork6
      const match = pageId.match(/mywork(\d+)/);
      if (match) {
        currentIndex = parseInt(match[1]) - 1; // 0-based index
      }
    } else {
      console.error(`Cannot determine page index from ID: ${pageId}`);
      return;
    }
  }

  // 다음/이전 페이지 인덱스 계산
  const allPages = modal.querySelectorAll(".character-page");
  const totalPages = allPages.length;

  let nextIndex;
  if (direction === "next") {
    nextIndex = (currentIndex + 1) % totalPages;
  } else if (direction === "prev") {
    nextIndex = (currentIndex - 1 + totalPages) % totalPages;
  } else {
    console.error(`Invalid direction: ${direction}. Use 'next' or 'prev'`);
    return;
  }

  // 다음 페이지 찾기 (data-page-index가 있으면 우선 사용, 없으면 ID 기반)
  let nextPage = modal.querySelector(`[data-page-index="${nextIndex}"]`);

  if (!nextPage) {
    // ID 기반으로 찾기
    const allPagesArray = Array.from(allPages);
    nextPage = allPagesArray.find((page) => {
      const pageId = page.id;
      let pageIndex = -1;

      if (pageId.includes("Page")) {
        const match = pageId.match(/(\d+)$/);
        if (match) {
          pageIndex = parseInt(match[1]) - 1;
        }
      } else if (pageId.includes("mywork")) {
        const match = pageId.match(/mywork(\d+)/);
        if (match) {
          pageIndex = parseInt(match[1]) - 1;
        }
      }

      return pageIndex === nextIndex;
    });
  }

  if (!nextPage) {
    console.error(`Page with index ${nextIndex} not found`);
    return;
  }

  // 페이지 전환
  currentPage.style.display = "none";
  nextPage.style.display = "flex";

  console.log(`Modal ${modalId}: ${currentPage.id} -> ${nextPage.id}`);
}

// 레거시 호환성을 위한 별칭 함수들
function nextProjectPage() {
  // 현재 프로젝트에 따라 적절한 모달 ID 결정
  let modalId;
  if (
    appState.currentProjectNumber >= 1 &&
    appState.currentProjectNumber <= 4
  ) {
    modalId = "projectModal"; // Team Work 모달
  } else {
    modalId = "myworkModal"; // My Work 모달
  }

  navigateModal(modalId, "next");
}

function prevProjectPage() {
  // 현재 프로젝트에 따라 적절한 모달 ID 결정
  let modalId;
  if (
    appState.currentProjectNumber >= 1 &&
    appState.currentProjectNumber <= 4
  ) {
    modalId = "projectModal"; // Team Work 모달
  } else {
    modalId = "myworkModal"; // My Work 모달
  }

  navigateModal(modalId, "prev");
}

function nextCharacterPage() {
  navigateModal("characterModal", "next");
}

function prevCharacterPage() {
  navigateModal("characterModal", "prev");
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

// Character 모달 관련 함수들
function openCharacterModal() {
  // 먼저 모든 모달 닫기
  closeAllModals();

  const modal = document.getElementById("characterModal");
  console.log("Character modal element:", modal);
  if (modal) {
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";
    console.log("Character modal opened successfully");
  } else {
    console.error("Character modal element not found!");
  }
}

// Tiger 모달 관련 함수들
function openTigerModal() {
  // 먼저 모든 모달 닫기
  closeAllModals();

  const modal = document.getElementById("tigerModal");
  console.log("Tiger modal element:", modal);
  if (modal) {
    modal.classList.add("show");
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";
    console.log("Tiger modal opened successfully");
  } else {
    console.error("Tiger modal element not found!");
  }
}

function closeTigerModal() {
  closeAllModals();
}

// 통합 모달 오버레이 클릭 이벤트
window.onclick = function (event) {
  // 모든 모달에 대해 오버레이 클릭 시 닫기
  const modals = [
    { id: "projectModal", element: document.getElementById("projectModal") },
    { id: "myworkModal", element: document.getElementById("myworkModal") },
    {
      id: "characterModal",
      element: document.getElementById("characterModal"),
    },
    { id: "tigerModal", element: document.getElementById("tigerModal") },
    { id: "bookModal", element: document.getElementById("bookModal") },
  ];

  modals.forEach(({ id, element }) => {
    if (element && event.target === element) {
      closeAllModals();
    }
  });
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

// 모바일 체크 함수
function isMobile() {
  return window.innerWidth < 768;
}

// 터치 디바이스 감지 함수
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// TeamWork 액션 핸들러 (모바일: 다음 슬라이드, 데스크톱: 스킵)
function handleTeamWorkAction() {
  if (isMobile()) {
    nextTeamWorkSlide();
  } else {
    skipTeamWork();
  }
}

// MyWork 액션 핸들러 (모바일: 다음 슬라이드, 데스크톱: 스킵)
function handleMyWorkAction() {
  if (isMobile()) {
    nextMyWorkSlide();
  } else {
    skipMyWork();
  }
}

// 페이지 위치 계산 함수 (전역, 정확도 개선)
function getPagePositionsGlobal() {
  const container = document.querySelector(".fullpage-container");
  const pages = document.querySelectorAll(".page");
  const positions = [];

  pages.forEach((page) => {
    // offsetTop은 문서 상단(또는 container 상단)으로부터의 정확한 위치
    positions.push(page.offsetTop);
  });

  return positions;
}

function skipTeamWork() {
  const container = document.querySelector(".fullpage-container");
  const positions = getPagePositionsGlobal();

  // My Work 페이지로 이동 (페이지 인덱스 3)
  container.scrollTo({
    top: positions[3],
    behavior: "smooth",
  });

  // 네비게이션 활성화
  setTimeout(() => {
    updateActiveNav(3);
  }, 100);
}

// 전역 슬라이드 함수들
function nextMyWorkSlide() {
  if (appState.isAnimating || appState.myworkSlides.length === 0) return;
  appState.isAnimating = true;

  const currentSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];
  appState.myworkCurrentSlide =
    (appState.myworkCurrentSlide + 1) % appState.myworkSlides.length;
  const nextSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];

  // 현재 슬라이드 아웃
  animateSlideOut(currentSlideEl);

  setTimeout(() => {
    currentSlideEl.classList.remove("active");
    nextSlideEl.classList.add("active");
    animateSlideIn(nextSlideEl);

    // 카운터 업데이트
    updateMyWorkCounter();

    setTimeout(() => {
      appState.isAnimating = false;
    }, 1000);
  }, 800);
}

function nextTeamWorkSlide() {
  if (appState.isAnimating || appState.teamworkSlides.length === 0) return;
  appState.isAnimating = true;

  const currentSlideEl = appState.teamworkSlides[appState.teamworkCurrentSlide];
  appState.teamworkCurrentSlide =
    (appState.teamworkCurrentSlide + 1) % appState.teamworkSlides.length;
  const nextSlideEl = appState.teamworkSlides[appState.teamworkCurrentSlide];

  // 현재 슬라이드 아웃
  animateSlideOut(currentSlideEl);

  setTimeout(() => {
    currentSlideEl.classList.remove("active");
    nextSlideEl.classList.add("active");
    animateSlideIn(nextSlideEl);

    // 카운터 업데이트
    updateTeamWorkCounter();

    setTimeout(() => {
      appState.isAnimating = false;
    }, 1000);
  }, 800);
}

// 슬라이드 애니메이션 함수들
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

function updateMyWorkCounter() {
  const currentSlideElement = document.querySelector(
    ".mywork-page .current-slide"
  );
  if (currentSlideElement) {
    const slideNumber = (appState.myworkCurrentSlide + 1)
      .toString()
      .padStart(2, "0");
    currentSlideElement.textContent = slideNumber;
  }
}

function updateTeamWorkCounter() {
  const currentSlideElement = document.querySelector(
    ".teamwork-page .current-slide"
  );
  if (currentSlideElement) {
    const slideNumber = (appState.teamworkCurrentSlide + 1)
      .toString()
      .padStart(2, "0");
    currentSlideElement.textContent = slideNumber;
  }
}

// 이전 슬라이드 함수들
function prevMyWorkSlide() {
  if (appState.isAnimating || appState.myworkSlides.length === 0) return;
  appState.isAnimating = true;

  const currentSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];
  appState.myworkCurrentSlide =
    (appState.myworkCurrentSlide - 1 + appState.myworkSlides.length) %
    appState.myworkSlides.length;
  const prevSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];

  // 현재 슬라이드 아웃
  animateSlideOut(currentSlideEl);

  setTimeout(() => {
    currentSlideEl.classList.remove("active");
    prevSlideEl.classList.add("active");
    animateSlideIn(prevSlideEl);

    // 카운터 업데이트
    updateMyWorkCounter();

    setTimeout(() => {
      appState.isAnimating = false;
    }, 1000);
  }, 800);
}

function prevTeamWorkSlide() {
  if (appState.isAnimating || appState.teamworkSlides.length === 0) return;
  appState.isAnimating = true;

  const currentSlideEl = appState.teamworkSlides[appState.teamworkCurrentSlide];
  appState.teamworkCurrentSlide =
    (appState.teamworkCurrentSlide - 1 + appState.teamworkSlides.length) %
    appState.teamworkSlides.length;
  const prevSlideEl = appState.teamworkSlides[appState.teamworkCurrentSlide];

  // 현재 슬라이드 아웃
  animateSlideOut(currentSlideEl);

  setTimeout(() => {
    currentSlideEl.classList.remove("active");
    prevSlideEl.classList.add("active");
    animateSlideIn(prevSlideEl);

    // 카운터 업데이트
    updateTeamWorkCounter();

    setTimeout(() => {
      appState.isAnimating = false;
    }, 1000);
  }, 800);
}

// 중복된 함수 제거 - 이미 위에서 정의됨

// 슬라이드쇼 기능 복구
function initSlideshow() {
  // 전역 변수들로 슬라이드 요소들 초기화
  appState.myworkSlides = document.querySelectorAll(".mywork-page .slide");
  appState.teamworkSlides = document.querySelectorAll(".teamwork-page .slide");
  const myworkCounterStrip = document.querySelector(
    ".mywork-page .counter-strip"
  );
  const teamworkCounterStrip = document.querySelector(
    ".teamwork-page .counter-strip"
  );

  // 전역 변수 초기화
  appState.myworkCurrentSlide = 0;
  appState.teamworkCurrentSlide = 0;
  appState.isAnimating = false;

  // 슬라이드 초기화
  function initSlides() {
    // My Work 슬라이드 초기화
    appState.myworkSlides.forEach((slide, index) => {
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
    appState.teamworkSlides.forEach((slide, index) => {
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

  // 슬라이드 인 애니메이션 - 전역 함수 사용

  // 슬라이드 아웃 애니메이션 - 전역 함수 사용

  // My Work 다음 슬라이드로 이동 - 전역 함수 사용

  // My Work 이전 슬라이드로 이동
  function prevMyWorkSlide() {
    if (appState.isAnimating) return;
    appState.isAnimating = true;

    const currentSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];
    appState.myworkCurrentSlide =
      (appState.myworkCurrentSlide - 1 + appState.myworkSlides.length) %
      appState.myworkSlides.length;
    const prevSlideEl = appState.myworkSlides[appState.myworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      prevSlideEl.classList.add("active");
      animateSlideIn(prevSlideEl);

      // 카운터 업데이트
      updateMyWorkCounter();

      setTimeout(() => {
        appState.isAnimating = false;
      }, 1000);
    }, 800);
  }

  // Team Work 다음 슬라이드로 이동 - 전역 함수 사용

  // Team Work 이전 슬라이드로 이동
  function prevTeamWorkSlide() {
    if (appState.isAnimating) return;
    appState.isAnimating = true;

    const currentSlideEl =
      appState.teamworkSlides[appState.teamworkCurrentSlide];
    appState.teamworkCurrentSlide =
      (appState.teamworkCurrentSlide - 1 + appState.teamworkSlides.length) %
      appState.teamworkSlides.length;
    const prevSlideEl = appState.teamworkSlides[appState.teamworkCurrentSlide];

    // 현재 슬라이드 아웃
    animateSlideOut(currentSlideEl);

    setTimeout(() => {
      currentSlideEl.classList.remove("active");
      prevSlideEl.classList.add("active");
      animateSlideIn(prevSlideEl);

      // 카운터 업데이트
      updateTeamWorkCounter();

      setTimeout(() => {
        appState.isAnimating = false;
      }, 1000);
    }, 800);
  }

  // My Work 카운터 업데이트 - 전역 함수 사용

  // Team Work 카운터 업데이트 - 전역 함수 사용

  // 스크롤 이벤트 - 개선된 버전
  let slideScrollTimeout;
  let slideScrollThreshold = 60; // 슬라이드 스크롤 임계값 (px)
  let lastSlideScrollTime = 0;
  let slideScrollDebounceDelay = 200; // 슬라이드 스크롤 디바운싱 (ms)

  const myworkPage = domElements.myworkPage;
  const teamworkPage = domElements.teamworkPage;
  const container = domElements.container;
  const pages = domElements.pages;

  if (myworkPage) {
    myworkPage.addEventListener(
      "wheel",
      (e) => {
        // 모바일에서는 슬라이드 wheel 이벤트 비활성화
        if (isMobile()) {
          return;
        }

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
            if (
              appState.myworkCurrentSlide <
              appState.myworkSlides.length - 1
            ) {
              nextMyWorkSlide();
            } else {
              // 마지막 슬라이드에서 다음 섹션으로 이동
              container.scrollTo({
                top: pages[4].offsetTop, // Design Work 섹션 (페이지 4)
                behavior: "smooth",
              });
            }
          } else {
            // 이전 슬라이드로 이동
            if (appState.myworkCurrentSlide > 0) {
              prevMyWorkSlide();
            } else {
              // 첫 번째 슬라이드에서 이전 섹션으로 이동
              container.scrollTo({
                top: pages[2].offsetTop, // Team Work 섹션 (페이지 2)
                behavior: "smooth",
              });
            }
          }
        }, 60); // 슬라이드 전환 딜레이 최적화
      },
      { passive: false }
    );
  }

  if (teamworkPage) {
    teamworkPage.addEventListener(
      "wheel",
      (e) => {
        // 모바일에서는 슬라이드 wheel 이벤트 비활성화
        if (isMobile()) {
          return;
        }

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
            if (
              appState.teamworkCurrentSlide <
              appState.teamworkSlides.length - 1
            ) {
              nextTeamWorkSlide();
            } else {
              // 마지막 슬라이드에서 다음 섹션으로 이동
              const positions = getPagePositionsGlobal();

              container.scrollTo({
                top: positions[3], // My Work 섹션 (페이지 3)
                behavior: "smooth",
              });
            }
          } else {
            // 이전 슬라이드로 이동
            if (appState.teamworkCurrentSlide > 0) {
              prevTeamWorkSlide();
            } else {
              // 첫 번째 슬라이드에서 이전 섹션으로 이동
              const positions = getPagePositionsGlobal();

              container.scrollTo({
                top: positions[1], // Skills 섹션 (페이지 1)
                behavior: "smooth",
              });
            }
          }
        }, 120); // 슬라이드 전환 딜레이 최적화
      },
      { passive: false }
    );
  }

  // 모바일 터치 이벤트 추가
  function initMobileTouchEvents() {
    if (!isMobile()) return;

    let startX = 0;
    let startY = 0;
    let isTouch = false;

    // MyWork 페이지 터치 이벤트
    if (myworkPage) {
      myworkPage.addEventListener(
        "touchstart",
        (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isTouch = true;
        },
        { passive: true }
      );

      myworkPage.addEventListener(
        "touchend",
        (e) => {
          if (!isTouch) return;

          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const deltaX = endX - startX;
          const deltaY = endY - startY;

          // 수평 스와이프가 수직 스와이프보다 큰 경우
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              // 오른쪽 스와이프 - 이전 슬라이드
              if (appState.myworkCurrentSlide > 0) {
                prevMyWorkSlide();
              }
            } else {
              // 왼쪽 스와이프 - 다음 슬라이드
              if (
                appState.myworkCurrentSlide <
                appState.myworkSlides.length - 1
              ) {
                nextMyWorkSlide();
              }
            }
          }

          isTouch = false;
        },
        { passive: true }
      );
    }

    // TeamWork 페이지 터치 이벤트
    if (teamworkPage) {
      teamworkPage.addEventListener(
        "touchstart",
        (e) => {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          isTouch = true;
        },
        { passive: true }
      );

      teamworkPage.addEventListener(
        "touchend",
        (e) => {
          if (!isTouch) return;

          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const deltaX = endX - startX;
          const deltaY = endY - startY;

          // 수평 스와이프가 수직 스와이프보다 큰 경우
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              // 오른쪽 스와이프 - 이전 슬라이드
              if (appState.teamworkCurrentSlide > 0) {
                prevTeamWorkSlide();
              }
            } else {
              // 왼쪽 스와이프 - 다음 슬라이드
              if (
                appState.teamworkCurrentSlide <
                appState.teamworkSlides.length - 1
              ) {
                nextTeamWorkSlide();
              }
            }
          }

          isTouch = false;
        },
        { passive: true }
      );
    }
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
        // Skip 버튼 클릭인 경우 커스텀 커서 로직 무시
        if (e.target.closest(".skip-button")) {
          return; // Skip 버튼의 onclick 이벤트가 실행되도록 함
        }

        const rect = pageElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pageWidth = rect.width;
        const leftArea = pageWidth * 0.3;
        const rightArea = pageWidth * 0.7;

        if (!isOverProjectBox && !isOverSkipButton) {
          if (x < leftArea) {
            // 왼쪽 클릭 - 이전 슬라이드 또는 이전 섹션
            if (pageElement.classList.contains("mywork-page")) {
              if (appState.myworkCurrentSlide === 0) {
                // 첫 번째 슬라이드에서 이전 섹션으로 이동
                container.scrollTo({
                  top: pages[2].offsetTop, // Team Work 섹션 (페이지 2)
                  behavior: "smooth",
                });
              } else {
                prevSlideFunc();
              }
            } else if (pageElement.classList.contains("teamwork-page")) {
              if (appState.teamworkCurrentSlide === 0) {
                // 첫 번째 슬라이드에서 이전 섹션으로 이동
                container.scrollTo({
                  top: pages[1].offsetTop, // Skills 섹션 (페이지 1)
                  behavior: "smooth",
                });
              } else {
                prevSlideFunc();
              }
            }
          } else if (x > rightArea) {
            // 오른쪽 클릭 - 다음 슬라이드 또는 다음 섹션
            if (pageElement.classList.contains("mywork-page")) {
              if (
                appState.myworkCurrentSlide ===
                appState.myworkSlides.length - 1
              ) {
                // 마지막 슬라이드에서 다음 섹션으로 이동
                container.scrollTo({
                  top: pages[4].offsetTop, // Design Work 섹션 (페이지 4)
                  behavior: "smooth",
                });
              } else {
                nextSlideFunc();
              }
            } else if (pageElement.classList.contains("teamwork-page")) {
              if (
                appState.teamworkCurrentSlide ===
                appState.teamworkSlides.length - 1
              ) {
                // 마지막 슬라이드에서 다음 섹션으로 이동
                container.scrollTo({
                  top: pages[3].offsetTop, // My Work 섹션 (페이지 3)
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
  initMobileTouchEvents();
  initCustomCursor();
  initDesignWorkButtons();
}

// Design Work 버튼 이벤트 초기화
function initDesignWorkButtons() {
  // more-btn은 관상용이므로 클릭 이벤트를 제거하고 호버 효과만 유지
  const moreButtons = document.querySelectorAll(
    ".design-project-box .more-btn"
  );

  moreButtons.forEach((button, index) => {
    // more-btn 클릭 시 부모 이벤트를 차단하지 않도록 수정
    button.addEventListener("click", (e) => {
      // stopPropagation 제거 - 부모 박스의 클릭 이벤트가 실행되도록 함
      // 실제 모달 열기는 부모 박스의 onclick에서 처리됨
    });
  });

  // 프로젝트 박스 전체 클릭 이벤트 확인
  const projectBoxes = document.querySelectorAll(".design-project-box");

  projectBoxes.forEach((box, index) => {
    // onclick 속성이 이미 있으므로 추가 이벤트 리스너는 필요 없음
    // 하지만 디버깅을 위해 클릭 이벤트 추가
    box.addEventListener("click", (e) => {
      // onclick 속성의 openModal 함수가 실행됨
    });
  });
}

// 책표지 클릭 이벤트 초기화
function initBookCovers() {
  const bookItems = document.querySelectorAll(".book-item");

  bookItems.forEach((item, index) => {
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

  brochureItems.forEach((item, index) => {
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

  etcItems.forEach((item, index) => {
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

  console.log("Book modal element:", modal);
  console.log("Book modal image element:", modalImage);

  if (modal && modalImage) {
    modalImage.src = imageSrc;
    modal.style.display = "block";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";
    document.body.style.overflow = "hidden";
    console.log("Book modal opened successfully");
  } else {
    console.error("Book modal elements not found!");
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
  const container =
    domElements.container || document.querySelector(".fullpage-container");

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

  // 페이지 스크롤 시 말풍선 숨기기 (데스크톱 휠)
  if (container) {
    container.addEventListener(
      "wheel",
      () => {
        hideTooltip();
      },
      { passive: true }
    );

    // 페이지 스크롤 시 말풍선 숨기기 (스크롤 이벤트)
    container.addEventListener(
      "scroll",
      () => {
        hideTooltip();
      },
      { passive: true }
    );

    // 모바일 터치 스크롤 시작 시 말풍선 숨기기
    container.addEventListener(
      "touchstart",
      () => {
        hideTooltip();
      },
      { passive: true }
    );
  }

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

    let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let y = rect.top - tooltipRect.height + 5;
    let position = "tooltip-top";

    // 화면 밖으로 나가지 않도록 위치 조정
    if (y < 0) {
      y = rect.bottom + 10;
      position = "tooltip-bottom";
    }

    // 오른쪽 경계 체크 (tooltip이 화면 오른쪽을 벗어나는 경우)
    if (x + tooltipRect.width > viewportWidth) {
      x = viewportWidth - tooltipRect.width - 10; // 우측 여백 10px
      position = "tooltip-right";
    }

    // 왼쪽 경계 체크 (tooltip이 화면 왼쪽을 벗어나는 경우)
    if (x < 0) {
      x = 10; // 좌측 여백 10px
      position = "tooltip-left";
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
    if (appState.currentAnimationTimer) {
      clearTimeout(appState.currentAnimationTimer);
      appState.currentAnimationTimer = null;
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
    appState.isDesignTitleAnimating = true;
    appState.currentAnimationTimer = setTimeout(() => {
      appState.isDesignTitleAnimating = false;
      appState.currentAnimationTimer = null;
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

// 햄버거 메뉴 토글 기능
function initHamburgerMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  // 햄버거 메뉴 클릭 이벤트
  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  // 모바일 네비게이션 오버레이 클릭 이벤트 (오버레이 영역 클릭 시 닫기)
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener("click", (e) => {
      if (e.target === mobileNavOverlay) {
        closeMobileMenu();
      }
    });
  }

  // ESC 키로 메뉴 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileNavOverlay.classList.contains("active")) {
      closeMobileMenu();
    }
  });
}

// 모바일 메뉴 토글 함수
function toggleMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");

  if (hamburgerMenu && mobileNavOverlay) {
    const isActive = mobileNavOverlay.classList.contains("active");

    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }
}

// 모바일 메뉴 열기 함수
function openMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");
  const headerEl = document.querySelector("header");

  if (hamburgerMenu && mobileNavOverlay && headerEl) {
    hamburgerMenu.classList.add("active");
    mobileNavOverlay.classList.add("active");
    headerEl.classList.add("nav-open");
    document.body.style.overflow = "hidden";
  }
}

// 모바일 메뉴 닫기 함수
function closeMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const mobileNavOverlay = document.getElementById("mobileNavOverlay");
  const headerEl = document.querySelector("header");

  if (hamburgerMenu && mobileNavOverlay && headerEl) {
    hamburgerMenu.classList.remove("active");
    mobileNavOverlay.classList.remove("active");
    headerEl.classList.remove("nav-open");
    document.body.style.overflow = "";
  }
}

// 윈도우 리사이즈 이벤트 (1440px 초과 시 모바일 메뉴 자동 닫기)
function handleWindowResize() {
  if (window.innerWidth > 1440) {
    closeMobileMenu();
  }
}
