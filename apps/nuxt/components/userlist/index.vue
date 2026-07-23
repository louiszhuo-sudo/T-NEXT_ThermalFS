<template>
    <div ref="echartsCanvas" style="height: 138px; width: 180px;background-color: white;">chart loading...</div>
</template>
<script setup>
const data1 = useAttrs().formtData
const runIndex = reactive({
    index: 0
})
const echartsCanvas = ref('')
useHead({
    script: [{
        src: '/js/echarts.js',
        async: true,
        defer: true,
        onload: () => {
            runIndex.index++
        }
    }]
})
watch(
    () => runIndex.index,
    (data, prevData) => {
        var loadingPlugin = 1 // 要載入幾個地圖套件(需含主程式)
        // console.log(data);
        if (data === loadingPlugin) {
            console.log('js load');
            runEcharts()
        }
    }
)
const runEcharts = () => {
    // var chartDom = document.getElementById('main');
    var myChart = echarts.init(echartsCanvas.value);
    const colorPalette = ['#37484C', '#9aa2a4', '#d8dddd', '#E6E8E9']
    var option
    option = {
        tooltip: {
            trigger: 'item',
        },
        legend: {
            show: false,
            top: '10px',
            width: '100px',
            left: 'right',
            itemWidth: 10, // 图例的宽度
            itemHeight: 10, // 图例的高度
            textStyle: {
                // 图例文字的样式
                color: '#ccc',
                fontSize: 15,
            },
        },

        series: [
            {
                name: '',
                top: '0px',
                right: "0px",
                avoidLabelOverlap: false,
                type: 'pie',
                radius: ['70%', '90%'],
                itemStyle: {
                    // borderRadius: 5,
                    // borderColor: '#fff',
                    // borderWidth: 3,
                },

                color: colorPalette,

                label: {
                    show: true,
                    position: 'center',
                    // formatter(d) {
                    // return d.value;
                    // formatter: '{d}%',
                    formatter: '{c}',
                    fontSize: '16',
                    // backgroundColor: 'white',

                },

                emphasis: {
                    label: {
                        show: true,
                        // fontSize: '60',
                        // fontWeight: 'bold',
                        // backgroundColor: 'white',
                        // borderColor: '#fff',
                        borderWidth: 5,
                    },
                },
                labelLine: {
                    show: true,
                },
                data: [
                    { name: '開通數量', value: data1.opened },
                    { name: '啟用', value: data1.on },
                    { name: '停用', value: data1.off },
                    { name: '尚有', value: data1.nohave },
                ],
            },
        ],
    }

    option && myChart.setOption(option);
}
</script>
<style scoped></style>
