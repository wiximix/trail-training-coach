const testPredictAPI = async () => {
  try {
    // 测试1: 创建测试成员
    console.log("步骤1: 创建测试成员...");
    const memberResponse = await fetch('http://localhost:5000/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "测试成员",
        weight: 70,
        marathonPace: "6:00/km",
        terrainPaceFactors: {
          sand: 1.1,
          farmRoad: 1.0,
          mountainRoad: 1.0,
          stoneRoad: 1.0,
          steps: 1.0
        },
        crampFrequency: "从来没有",
        expectedSweatRate: "多汗",
        preferredSupplyTypes: ["能量胶"]
      })
    });

    if (!memberResponse.ok) {
      const error = await memberResponse.json();
      console.log("成员创建可能已存在，继续测试...");
    } else {
      const member = await memberResponse.json();
      console.log("✓ 成员创建成功:", member.data?.id);
      testMemberId = member.data?.id;
    }

    // 测试2: 创建测试赛道
    console.log("\n步骤2: 创建测试赛道...");
    const trailResponse = await fetch('http://localhost:5000/api/trails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "测试赛道",
        cpCount: 3,
        checkpoints: [
          { id: 1, distance: 10, elevation: 300, downhillDistance: 50, terrainType: "山路" },
          { id: 2, distance: 10, elevation: 400, downhillDistance: 80, terrainType: "机耕道" },
          { id: 3, distance: 10, elevation: 200, downhillDistance: 100, terrainType: "石铺路" }
        ]
      })
    });

    if (!trailResponse.ok) {
      const error = await trailResponse.json();
      console.log("赛道创建可能已存在，继续测试...");
    } else {
      const trail = await trailResponse.json();
      console.log("✓ 赛道创建成功:", trail.data?.id);
      testTrailId = trail.data?.id;
    }

    // 获取所有成员和赛道
    const membersList = await (await fetch('http://localhost:5000/api/members')).json();
    const trailsList = await (await fetch('http://localhost:5000/api/trails')).json();

    if (membersList.data && membersList.data.length > 0) {
      testMemberId = membersList.data[0].id;
      console.log("\n使用成员:", testMemberId, membersList.data[0].name);
    }

    if (trailsList.data && trailsList.data.length > 0) {
      testTrailId = trailsList.data[0].id;
      console.log("使用赛道:", testTrailId, trailsList.data[0].name);
    }

    if (!testMemberId || !testTrailId) {
      console.log("\n✗ 缺少测试数据");
      return;
    }

    // 测试3: 调用预测API
    console.log("\n步骤3: 调用预测API...");
    const predictResponse = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: testMemberId,
        trailId: testTrailId,
        plannedPace: "6:30/km",
        gelCarbs: 100,
        saltElectrolytes: 200,
        electrolytePowder: 300
      })
    });

    if (!predictResponse.ok) {
      const error = await predictResponse.json();
      console.log("✗ 预测API调用失败:", error);
      console.log("状态码:", predictResponse.status);
      return;
    }

    const result = await predictResponse.json();
    console.log("\n✓ 预测API调用成功!");
    console.log("\n预测结果:");
    console.log("- 预计时间:", result.data.estimatedTime);
    console.log("- 预计配速:", result.data.estimatedPace);
    console.log("- CP点数量:", result.data.checkpoints.length);
    console.log("- 补给策略:", result.data.overallSupplyStrategy);

    console.log("\n✅ 所有测试通过!");

  } catch (error) {
    console.log("✗ 测试失败:", error.message);
  }
};

let testMemberId = null;
let testTrailId = null;

testPredictAPI();
