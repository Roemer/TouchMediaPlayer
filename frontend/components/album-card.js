const template = `
    <div class="swiper-slide"
        :style="
        album.isnew ?
        'background: url(images/new.png) top right no-repeat, url(' + album.cover + '); background-size: 100px, auto;' :
        'background: url(' + album.cover + '); background-size: auto;'
        " @click="onClicked()">
    </div>
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
