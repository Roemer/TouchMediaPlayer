const template = `
<div class="swiper-slide" style="width: 100px; height: 150px;">
    <div class="card shadow-none" @click="onClicked()" style="width: 100px; vertical-align: middle; text-align: center;">
        <img :src="image" style="height: 100px; width:auto; object-fit: contain; text-align: center; background: white">
        <div class="card-text">
            {{ name }}
        </div>
    </div>
</div>
`;

export default {
    props: ['id', 'name', 'image'],
    data: function () {
        return {
        }
    },
    methods: {
        onClicked() {
            this.$emit('clicked', this.id)
        }
    },
    mounted: function () {
    },
    template: template,
}
