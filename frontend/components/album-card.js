const template = `
    <div class="swiper-slide" :style="'background-image:url(' + album.cover + ')'" @click="onClicked()"></div>
`;

export default {
    props: ["album"],
    data: function () {
        return {
        }
    },
    methods: {
        onClicked() {
            this.$emit('clicked', this.album)
        }
    },
    template: template,
}
