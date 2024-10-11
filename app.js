// Khai báo mảng cho các nút và liên kết
let nodes = [];
let links = [];

// Hàm cập nhật đồ thị
function updateGraph() {
    // Xóa nội dung cũ
    d3.select('#graph').selectAll('*').remove();

    // Thiết lập kích thước đồ thị
    const width = document.getElementById('graph').clientWidth;
    const height = 600;

    // Tạo đối tượng SVG và thêm khả năng zoom/pan
    const svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height)
        // Thêm tính năng zoom và pan
        .call(d3.zoom().on('zoom', function (event) {
            g.attr('transform', event.transform);
        }));

    // Thêm nhóm 'g' để chứa toàn bộ đồ thị
    const g = svg.append('g');

    // Thiết lập mô phỏng lực cho đồ thị
    const simulation = d3.forceSimulation(nodes)
        // Lực liên kết giữa các nút
        .force('link', d3.forceLink(links).distance(100).id(d => d.id))
        // Lực đẩy giữa các nút (giảm lực đẩy)
        .force('charge', d3.forceManyBody().strength(-200))
        // Lực trọng tâm để giữ các nút gần trung tâm
        .force('center', d3.forceCenter(width / 2, height / 2))
        // Lực kéo các nút về trục X và Y trung tâm
        .force('x', d3.forceX(width / 2).strength(0.05))
        .force('y', d3.forceY(height / 2).strength(0.05));

    // Vẽ các đường liên kết
    const link = g.append('g')
        .attr('stroke', 'white')
        .selectAll('line')
        .data(links)
        .enter().append('line');

    // Vẽ các nút
    const node = g.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 10)
        .attr('fill', 'white')
        // Thêm tính năng kéo thả cho các nút
        .call(drag(simulation));

    // Thêm nhãn cho các nút
    const label = g.append('g')
        .selectAll('text')
        .data(nodes)
        .enter().append('text')
        .attr('fill', 'white')
        .attr('font-size', 12)
        .text(d => d.id);

    // Cập nhật vị trí các phần tử trong mỗi "tick" của mô phỏng
    simulation.on('tick', () => {
        // Cập nhật vị trí đường liên kết
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        // Cập nhật vị trí các nút
        node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);

        // Cập nhật vị trí nhãn
        label
            .attr('x', d => d.x + 12)
            .attr('y', d => d.y + 4);
    });
}

// Hàm thêm tính năng kéo thả cho các nút
function drag(simulation) {
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        // Cố định vị trí nút khi bắt đầu kéo
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        // Cập nhật vị trí nút theo con trỏ chuột
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        // Thả tự do nút sau khi kéo xong
        event.subject.fx = null;
        event.subject.fy = null;
    }
    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

// Hàm thêm người mới
function addPerson() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    if (name && !nodes.find(node => node.id === name)) {
        // Thêm nút mới vào mảng nodes
        nodes.push({ id: name });
        updatePersonSelects();
        updateGraph();
    }
    nameInput.value = '';
}

// Hàm cập nhật danh sách chọn người để liên kết
function updatePersonSelects() {
    const personASelect = document.getElementById('personA');
    const personBSelect = document.getElementById('personB');
    personASelect.innerHTML = '';
    personBSelect.innerHTML = '';

    nodes.forEach(node => {
        // Tạo tùy chọn cho người A
        const optionA = document.createElement('option');
        optionA.value = node.id;
        optionA.text = node.id;
        personASelect.add(optionA);

        // Tạo tùy chọn cho người B
        const optionB = document.createElement('option');
        optionB.value = node.id;
        optionB.text = node.id;
        personBSelect.add(optionB);
    });
}

// Hàm liên kết hai người
function linkPeople() {
    const personA = document.getElementById('personA').value;
    const personB = document.getElementById('personB').value;
    if (personA && personB && personA !== personB) {
        // Kiểm tra xem liên kết đã tồn tại chưa
        if (!links.find(link => (link.source.id === personA && link.target.id === personB) || (link.source.id === personB && link.target.id === personA))) {
            // Thêm liên kết mới vào mảng links
            links.push({ source: personA, target: personB });
            updateGraph();
        }
    }
}

// Gọi hàm để vẽ đồ thị ban đầu
updateGraph();
