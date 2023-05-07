const template = `
    <div class="swiper-slide" @click="onClicked()">
        <img :src="album.cover" class="no-border" />
        <img v-if="album.isPreviousNew" src="images/previous-new.png" class="no-border banner-overlay" style="width: 100px;" />
        <img v-if="album.isNew" src="images/new.png" class="no-border banner-overlay" style="width: 100px;" />
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
